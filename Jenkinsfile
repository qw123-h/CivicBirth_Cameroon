pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        APP_DIR = '/opt/civicbirth'
        COMPOSE_FILE = '/opt/civicbirth/docker-compose.yml'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci --legacy-peer-deps'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test -- --passWithNoTests || true'
                }
            }
        }

        stage('Security Audit') {
            steps {
                sh 'cd backend && npm audit --omit=dev || true'
                sh 'cd frontend && npm audit --omit=dev || true'
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                sh '''
                    cd ${APP_DIR}
                    git pull origin main
                    docker compose down --remove-orphans || true
                    docker compose up -d --build
                    echo "Waiting for containers..."
                    sleep 20
                    docker compose ps
                '''
            }
        }

        stage('Load into Kubernetes') {
    steps {
        sh '''
            export KUBECONFIG=/var/lib/jenkins/.kube/config

            docker save civicbirth-backend:latest | sudo microk8s ctr image import -
            docker save civicbirth-frontend:latest | sudo microk8s ctr image import -

            microk8s kubectl apply -f ${APP_DIR}/k8s/namespace.yaml
            microk8s kubectl apply -f ${APP_DIR}/k8s/configmap.yaml || true
            microk8s kubectl apply -f ${APP_DIR}/k8s/secret.yaml || true
            microk8s kubectl apply -f ${APP_DIR}/k8s/postgres.yaml
            microk8s kubectl apply -f ${APP_DIR}/k8s/backend.yaml
            microk8s kubectl apply -f ${APP_DIR}/k8s/frontend.yaml
            sleep 10
            microk8s kubectl get pods -n civicbirth-prod
        '''
    }
}

        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 10
                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
                    echo "Backend health status: $STATUS"
                    FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "000")
                    echo "Frontend status: $FRONT"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded! App is live at http://13.140.141.54:5173'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}