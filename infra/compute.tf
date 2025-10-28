locals {
  backend_instance_family = split(".", var.backend_instance_type)[0]
  backend_is_graviton     = contains(["t4g", "c6g", "c7g", "m6g", "m7g"], local.backend_instance_family)
}

resource "tls_private_key" "backend_ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

data "aws_ssm_parameter" "backend_ami_arm" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

data "aws_ssm_parameter" "backend_ami_x86" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_key_pair" "backend" {
  key_name   = "${local.name_prefix}-ec2-key"
  public_key = tls_private_key.backend_ssh.public_key_openssh
}

resource "local_file" "backend_private_key" {
  filename        = "${path.module}/.${local.name_prefix}-ec2-key.pem"
  content         = tls_private_key.backend_ssh.private_key_pem
  file_permission = "0600"
}

data "aws_iam_policy_document" "backend_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backend" {
  name               = "${local.name_prefix}-backend-role"
  assume_role_policy = data.aws_iam_policy_document.backend_assume_role.json

  tags = merge(local.default_tags, {
    Name = "${local.name_prefix}-backend-role"
  })
}

data "aws_iam_policy_document" "backend_s3" {
  statement {
    sid    = "ListFrontendBucket"
    effect = "Allow"

    actions = [
      "s3:ListBucket"
    ]

    resources = [
      module.frontend_bucket.s3_bucket_arn,
      module.assets_bucket.s3_bucket_arn
    ]
  }

  statement {
    sid    = "ObjectAccess"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]

    resources = [
      "${module.frontend_bucket.s3_bucket_arn}/*",
      "${module.assets_bucket.s3_bucket_arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "backend_s3" {
  name   = "${local.name_prefix}-backend-s3"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.backend_s3.json
}

resource "aws_iam_instance_profile" "backend" {
  name = "${local.name_prefix}-backend-profile"
  role = aws_iam_role.backend.name
}

module "backend_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "5.7.1"

  name = local.backend_instance_name

  ami = var.backend_ami != "" ? var.backend_ami : (
    local.backend_is_graviton ? data.aws_ssm_parameter.backend_ami_arm.value : data.aws_ssm_parameter.backend_ami_x86.value
  )
  instance_type = var.backend_instance_type

  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.backend.id]
  key_name                    = aws_key_pair.backend.key_name
  associate_public_ip_address = true
  monitoring                  = false

  iam_instance_profile = aws_iam_instance_profile.backend.name

  user_data = <<-EOF
              #!/bin/bash
              set -e
              yum update -y
              amazon-linux-extras install docker -y
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ec2-user
              mkdir -p /home/ec2-user/logs
              EOF

  root_block_device = [{
    volume_type = var.backend_root_volume_type
    volume_size = var.backend_root_volume_size
    encrypted   = true
  }]

  metadata_options = {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = merge(local.default_tags, {
    Name      = local.backend_instance_name
    Component = "backend"
  })

  volume_tags = merge(local.default_tags, {
    Name = "${local.backend_instance_name}-root"
  })
}

resource "aws_eip" "backend" {
  count    = var.enable_backend_eip ? 1 : 0
  domain   = "vpc"
  instance = module.backend_instance.id

  tags = merge(local.default_tags, {
    Name = "${local.backend_instance_name}-eip"
  })

  depends_on = [module.backend_instance]
}
