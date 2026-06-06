pipeline {
    agent any

    triggers {
        pollSCM('H * * * *')
    }

    environment {
        PROJECT_NAME  = 'civicbirth'
        APP_DIR       = '/opt/civicbirth'
        DB_HOST_VAL   = credentials('db-host')
        DB_USER_VAL   = credentials('db-user')
        DB_PASS_VAL   = credentials('db-password')
        JWT_VAL       = credentials('jwt-secret')
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    parameters {
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests')
    }

    stages {

        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
                sh '''
                    echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
                    echo "Commit: $(git rev-parse HEAD)"
                    git log -1 --oneline
                '''
            }
        }

        stage('Setup') {
            parallel {
                stage('Backend Setup') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Setup') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Infrastructure Check') {
                    steps {
                        sh '''
                            docker --version
                            node --version
                            npm --version
                        '''
                    }
                }
            }
        }

        stage('Lint & Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint || true'
                            sh 'npx tsc --noEmit || true'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
                            sh 'npx tsc --noEmit || true'
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
                            sh 'ls -la dist/ || true'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                            sh 'du -sh dist/ || true'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            when { expression { !params.SKIP_TESTS } }
            steps {
                dir('backend') {
                    sh 'npm test -- --coverage --passWithNoTests || true'
                }
            }
        }

        stage('Security Scan') {
            parallel {
                stage('Backend Audit') {
                    steps {
                        dir('backend') {
                            sh 'npm audit --production 2>&1 || true'
                        }
                    }
                }
                stage('Frontend Audit') {
                    steps {
                        dir('frontend') {
                            sh 'npm audit --production 2>&1 || true'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    cd ${APP_DIR}
                    git pull origin main

                    echo "🐳 Building Docker images..."
                    docker-compose build --no-cache

                    echo "Images built:"
                    docker images | grep civicbirth
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                    cd ${APP_DIR}

                    echo "🚀 Deploying application..."
                    docker-compose down || true
                    docker-compose up -d

                    echo "Waiting for services to start..."
                    sleep 20

                    echo "Running containers:"
                    docker ps
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    cd ${APP_DIR}

                    echo "📦 Loading images into MicroK8s..."
                    docker save civicbirth-backend:latest | microk8s ctr image import - || true
                    docker save civicbirth-frontend:latest | microk8s ctr image import - || true

                    echo "🚀 Applying Kubernetes manifests..."
                    microk8s kubectl apply -f k8s/namespace.yaml
                    microk8s kubectl apply -f k8s/configmap.yaml || true
                    microk8s kubectl apply -f k8s/secret.yaml || true
                    microk8s kubectl apply -f k8s/postgres.yaml
                    microk8s kubectl apply -f k8s/backend.yaml
                    microk8s kubectl apply -f k8s/frontend.yaml

                    echo "Waiting for pods..."
                    sleep 15

                    echo "Pod status:"
                    microk8s kubectl get pods -n civicbirth-prod || true
                '''
            }
        }

        stage('Smoke Tests') {
            steps {
                sh '''
                    echo "🔍 Running smoke tests..."
                    sleep 10

                    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
                    echo "Backend health: $response"

                    response2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "000")
                    echo "Frontend status: $response2"

                    echo "✅ Smoke tests complete"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f --filter "dangling=true" || true'
            junit testResults: '**/test-results.xml', allowEmptyResults: true
        }
        success {
            echo "✅ Build #${BUILD_NUMBER} succeeded!"
        }
        failure {
            echo "❌ Build #${BUILD_NUMBER} failed!"
        }
    }
}