/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
        // getProviderRegistry()
        // Get the identity provider registry for this wallet. All identity types stored in the wallet must have a corresponding provider in the registry.
        // Returns:
        // An identity provider registry.

        // Register the user, enroll the user, and import the new identity into the wallet.
        //소속기관은 org1.department1, Id는 appUser, role은 client를 통해 
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);

        //<async> register(req, registrar)
            // Register the member and return an enrollment secret.
            // Parameters:
            // Name	Type	Description
            // req	RegisterRequest	The RegisterRequest
            // registrar	User	. The identity of the registrar (i.e. who is performing the registration)
            // Returns:
            // The enrollment secret to use when this user enrolls
            // Type
            // Promise
        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });

        //Enroll the member and return an opaque member object.
        //Opaque Type은 구체적인 타입을 숨기고, 해당 타입이 채택하고 있는 프로토콜의 관점에서 함수의 반환 값이나 프로퍼티를 사용하게 해줍니다. 실제 타입 정보에 대한 것을 감추어 모듈과 모듈 코드의 결합성을 줄이는 이점이 있게 됩니다.


        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('appUser', x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main();