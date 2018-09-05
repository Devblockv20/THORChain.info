# Deployment

1. Set relevant environment variables

sh
```
export AWS_ACCESS_KEY="ACCESSKEY"
export AWS_SECRET_KEY="SECRETKEY"
export SSH_KEY_NAME="THORChain.info-deployer-name"
export SSH_PUBLIC_FILE="$HOME/.ssh/id_rsa.pub"
export SSH_PRIVATE_FILE="$HOME/.ssh/id_rsa"
```

2. Build the apps

sh
```
cd api && yarn build && cd ..
cd gui && yarn build && cd ..
```

3. Setup infrastructure (only required once)

sh
```
cd deployment/terraform
terraform init && terraform apply -var AWS_ACCESS_KEY="${AWS_ACCESS_KEY}" -var AWS_SECRET_KEY="${AWS_SECRET_KEY}" -var SSH_KEY_NAME="${SSH_KEY_NAME}" -var SSH_PUBLIC_FILE="${SSH_PUBLIC_FILE}" -var SSH_PRIVATE_FILE="${SSH_PRIVATE_FILE}"
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i /usr/local/bin/terraform-inventory ../ansible/setup.yml
cd ../..
```

3. Setup infrastructure (only required once)

sh
```
cd deployment/terraform
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i /usr/local/bin/terraform-inventory ../ansible/deploy.yml
cd ../..
```
