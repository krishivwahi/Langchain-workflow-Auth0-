# generate-certs.ps1

$CertDir = "certs"
If (!(Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir | Out-Null
}

Write-Host "Generating Root CA..."
openssl genrsa -out "$CertDir\rootCA.key" 4096
openssl req -x509 -new -nodes -key "$CertDir\rootCA.key" -sha256 -days 3650 -out "$CertDir\rootCA.crt" -subj "/C=US/ST=State/L=City/O=Organization/CN=RootCA"

Write-Host "Generating Client Key and CSR..."
openssl genrsa -out "$CertDir\client.key" 2048
openssl req -new -key "$CertDir\client.key" -out "$CertDir\client.csr" -subj "/C=US/ST=State/L=City/O=Organization/CN=client"

Write-Host "Creating extension file for clientAuth EKU..."
$ExtFile = "$CertDir\client.ext"
@"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = clientAuth
"@ | Out-File -FilePath $ExtFile -Encoding ascii

Write-Host "Signing Client Certificate with Root CA..."
openssl x509 -req -in "$CertDir\client.csr" -CA "$CertDir\rootCA.crt" -CAkey "$CertDir\rootCA.key" -CAcreateserial -out "$CertDir\client.crt" -days 365 -sha256 -extfile $ExtFile

Write-Host "Certificates generated successfully in the '$CertDir' directory!"
Write-Host "Client Certificate: $CertDir\client.crt"
Write-Host "Client Private Key: $CertDir\client.key"
