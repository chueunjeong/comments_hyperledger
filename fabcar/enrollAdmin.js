/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
// Strict Mode는 ECMAScript 5 버전에 있는 새로운 기능으로써, 당신의 프로그램 또는 함수를 엄격한 운용 콘텍스트 안에서 실행시킬 수 있게끔 합니다. 
// 이 엄격한 콘텍스트는 몇가지 액션들을 실행할 수 없도록 하며, 좀 더 많은 예외를 발생시킵니다
// Strict Mode는 몇가지 면에서 도움이 되는데:
// 흔히 발생하는 코딩 실수를 잡아내서 예외를 발생시킵니다.
// 상대적으로 안전하지 않은 액션이 발생하는 것을 방지하거나 그럴 때 예외를 발생시킵니다. 예를 들자면 전역객체들에 접근하려 한다거나 하는 것들이겠지요.
// 혼란스럽거나 제대로 고려되지 않은 기능들을 비활성화시킵니다
'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        // ccpPath경로 => ../../test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // 위의 경로에서 utf8 json 방식으로 읽어오기

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        // 위의 ccp(json)에서 certificateAuthorities라는 array형식의 attribute 중 'ca.org1.example.com'에 해당되는 caInfo 가져오기
        // {
        //     "url": "https://localhost:7054",
        //     "caName": "ca-org1",
        //     "tlsCACerts": {
        //         "pem": "-----BEGIN CERTIFICATE-----\nMIICUDCCAfegAwIBAgIQaoMHAWvj38IXcbYavY2DcDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0yMDAxMjkxNTUzMDBaFw0zMDAxMjYxNTUzMDBa\nMHMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBvcmcxLmV4YW1wbGUuY29tMRwwGgYDVQQD\nExNjYS5vcmcxLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\nQ8+CXqVTlei+mR3Y2Vda/gVUvV+2x63UWLfPzp2HlSCc5HUY0zpAuoj6aKJEG6QO\nLo6jzeKaXAmKjTMRXUqbSqNtMGswDgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQG\nCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCu\nM9gNt7l+vG7owiLjzKBW3u/15/Igtb5aiv3HPUyyiDAKBggqhkjOPQQDAgNHADBE\nAiB0NWtHNsj67lOW1CgL+yaE5axD7jJGdi2DnS1Hos3vQAIgR4bQW2L4i4VFEp0M\n3we3tfSXUxU5Xt95kRNTSbSlvK0=\n-----END CERTIFICATE-----\n"
        //     },
        //     "httpOptions": {
        //         "verify": false
        //     }
        // }
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        //위에 부분에서 tlsCACerts부분 아래의 pem부분 긁어오기
        //"-----BEGIN CERTIFICATE-----\nMIICUDCCAfegAwIBAgIQaoMHAWvj38IXcbYavY2DcDAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0yMDAxMjkxNTUzMDBaFw0zMDAxMjYxNTUzMDBa\nMHMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBvcmcxLmV4YW1wbGUuY29tMRwwGgYDVQQD\nExNjYS5vcmcxLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\nQ8+CXqVTlei+mR3Y2Vda/gVUvV+2x63UWLfPzp2HlSCc5HUY0zpAuoj6aKJEG6QO\nLo6jzeKaXAmKjTMRXUqbSqNtMGswDgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQG\nCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCu\nM9gNt7l+vG7owiLjzKBW3u/15/Igtb5aiv3HPUyyiDAKBggqhkjOPQQDAgNHADBE\nAiB0NWtHNsj67lOW1CgL+yaE5axD7jJGdi2DnS1Hos3vQAIgR4bQW2L4i4VFEp0M\n3we3tfSXUxU5Xt95kRNTSbSlvK0=\n-----END CERTIFICATE-----\n"
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        //위의 caInfo에서 url 부분과 caTLSCACerts 부분 caName 부분을 이용하여 fabric-ca-client 모듈을 바탕으로 FabricCAServices 만들기

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        //process.cwd() 현재 작업 디렉토리/wallet        
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        //위에서 추가한 fabric-network 모듈에서 위에 경로를 통해 새 파일 시스템 기반 월렛이 생성될 때까지 기다린다.
        console.log(`Wallet path: ${walletPath}`);
        //위 경로 출력, 단 위의 작업이 끝난 후

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');

        //         <async> get(label)
        // Get an identity from the wallet. The actual properties of this identity object will vary depending on its type.
        // Parameters:
        // Name	Type	Description
        // label		Label used to identify the identity within the wallet.
        // Returns:
        // An identity if it exists; otherwise undefined.
        // Type
        // Promise.<(module:fabric-network.Identity|undefined)>
        //var a = undefined;
        ///!undefinded == true
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

        //         1. X.509

        //   ㅇ 공개키기반구조의 인증 서비스를 구현하기 위한 인증 틀(Authentication Framework)
        //      - ITU-T (X.509) 및 ISO (ISO/IEC 9594-8) 공동 표준
        //      - 표준 Title :
        //         `Information technology - Open systems interconnection - The Directory: 
        //          Public-key and attribute certificate frameworks`


        // 2. X.509 에서 규정하고 있는 것

        //   ㅇ X.500 디렉토리에서 인증 서비스 구조를 규정
        //   ㅇ 공개키 인증 프로토콜을 규정
        //   ㅇ 인증서 형식을 규정

        //   ※ 주로, 인증서의 작성,교환을 위한 표준 규격
        //      - 많은 어플리케이션에서 이를 지원하고 있음
        //         . 例) S/MIME, SSL/TLS, SET 등


        // 3. X.509 특징 

        //   ㅇ X.509에서 디렉토리 인증은 비밀키 기술이나 공개키 기술을 사용하여 수행 가능

        //   ㅇ 표준에 대해 RSA 알고리즘과 같은 부가적으로 활용하도록 하기 위해,
        //      X.509 표준은 어떤 특정한 암호알고리즘을 지정하지 않고 있다.


        // 4. X.509 인증서(Certificate)

        //   ㅇ 가장 널리 알려진 표준 인증서 형식
        //      - X.500 안에서 주로 인증서에 대해 기술하고 있음
        //      - 인증서 내부 구성정보의 형식 정의

        //   ㅇ X.509 인증서 구성                                            ☞  X.509 인증서 형식 참조
        //      - 서명전 인증서 (To be Cetificated)
        //         . 버전(Version), 일련번호(Serial Number), 알고리즘식별자(Algorithm Identifier),
        //           발행자(Issuer), 유효개시시간, 유효만료시간 등
        //      - 디지털 서명 알고리즘 (Signature Algorithm)
        //      - 디지털 서명 (Digital Signature) 본체

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();