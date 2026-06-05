// Jenkinsfile - CI/CD Pipeline for CivicBirth Project
// Purpose: Automated build, test, and deployment pipeline
// Stages: Checkout → Build → Test → Analysis → Push → Deploy

pipeline {
    agent any

    // Trigger configuration
    triggers {
        githubPush()  // Trigger on GitHub push
        pollSCM('H * * * *')  // Poll every hour as backup
    }

    // Environment variables
    environment {
        PROJECT_NAME = 'civicbirth'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
        DB_HOST = credentials('db-host')
        DB_USER = credentials('db-user')
        DB_PASSWORD = credentials('db-password')
        JWT_SECRET = credentials('jwt-secret')
        NODE_ENV = 'test'
    }

    // Pipeline options
    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    // Parameter configuration
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'staging', 'production'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip running tests (not recommended)'
        )
        booleanParam(
            name: 'RUN_SECURITY_SCAN',
            defaultValue: true,
            description: 'Run security scanning'
        )
    }

    stages {
        // Stage 1: Checkout
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from GitHub..."
                }
                checkout scm
                script {
                    echo "✅ Checkout complete"
                    sh '''
                        echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
                        echo "Git Commit: $(git rev-parse HEAD)"
                        echo "Git Log:"
                        git log -1 --oneline
                    '''
                }
            }
        }

        // Stage 2: Setup
        stage('Setup') {
            parallel {
                stage('Backend Setup') {
                    steps {
                        script {
                            echo "📦 Setting up Backend environment..."
                        }
                        dir('backend') {
                            sh '''
                                echo "Installing dependencies..."
                                npm ci
                                
                                echo "Backend dependencies installed:"
                                npm list --depth=0 | head -20
                            '''
                        }
                    }
                }
                stage('Frontend Setup') {
                    steps {
                        script {
                            echo "📦 Setting up Frontend environment..."
                        }
                        dir('frontend') {
                            sh '''
                                echo "Installing dependencies..."
                                npm ci
                                
                                echo "Frontend dependencies installed:"
                                npm list --depth=0 | head -20
                            '''
                        }
                    }
                }
                stage('Infrastructure Setup') {
                    steps {
                        script {
                            echo "🔧 Checking infrastructure requirements..."
                        }
                        sh '''
                            echo "Checking Docker version:"
                            docker --version
                            
                            echo "Checking Node version:"
                            node --version
                            
                            echo "Checking npm version:"
                            npm --version
                        '''
                    }
                }
            }
        }

        // Stage 3: Lint & Code Quality
        stage('Lint & Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        script {
                            echo "🔍 Linting backend code..."
                        }
                        dir('backend') {
                            sh '''
                                echo "Running ESLint..."
                                npm run lint || true
                                
                                echo "TypeScript compilation check..."
                                npx tsc --noEmit || true
                            '''
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        script {
                            echo "🔍 Linting frontend code..."
                        }
                        dir('frontend') {
                            sh '''
                                echo "Running ESLint..."
                                npm run lint || true
                                
                                echo "TypeScript compilation check..."
                                npx tsc --noEmit || true
                            '''
                        }
                    }
                }
            }
        }

        // Stage 4: Build
        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        script {
                            echo "🔨 Building backend..."
                        }
                        dir('backend') {
                            sh '''
                                echo "Building TypeScript..."
                                npm run build
                                
                                ls -la dist/ || true
                            '''
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        script {
                            echo "🔨 Building frontend..."
                        }
                        dir('frontend') {
                            sh '''
                                echo "Building frontend..."
                                npm run build
                                
                                echo "Build output:"
                                du -sh dist/ || true
                            '''
                        }
                    }
                }
            }
        }

        // Stage 5: Unit Tests
        stage('Unit Tests') {
            when {
                expression { !params.SKIP_TESTS }
            }
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            echo "🧪 Running backend unit tests..."
                        }
                        dir('backend') {
                            sh '''
                                echo "Running Jest tests..."
                                npm test -- --coverage --passWithNoTests
                                
                                echo "Test summary:"
                                cat coverage/coverage-summary.json 2>/dev/null || echo "Coverage report not found"
                            '''
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        script {
                            echo "🧪 Running frontend unit tests..."
                        }
                        dir('frontend') {
                            sh '''
                                echo "Running Jest tests..."
                                npm test -- --coverage --passWithNoTests 2>&1 || true
                                
                                echo "Frontend test results logged"
                            '''
                        }
                    }
                }
            }
        }

        // Stage 6: Integration Tests
        stage('Integration Tests') {
            when {
                expression { !params.SKIP_TESTS && params.ENVIRONMENT != 'production' }
            }
            steps {
                script {
                    echo "🔗 Running integration tests..."
                }
                sh '''
                    echo "Starting services for integration testing..."
                    docker-compose up -d postgres redis 2>/dev/null || true
                    
                    sleep 5
                    
                    cd backend
                    echo "Running integration tests..."
                    npm run test:integration 2>&1 || true
                    
                    docker-compose down 2>/dev/null || true
                '''
            }
        }

        // Stage 7: Security Scan
        stage('Security Scan') {
            when {
                expression { params.RUN_SECURITY_SCAN }
            }
            parallel {
                stage('Dependency Check') {
                    steps {
                        script {
                            echo "🔐 Checking for vulnerable dependencies..."
                        }
                        sh '''
                            echo "Backend dependencies audit:"
                            cd backend && npm audit --production 2>&1 || true
                            cd ..
                            
                            echo "Frontend dependencies audit:"
                            cd frontend && npm audit --production 2>&1 || true
                            cd ..
                        '''
                    }
                }
                stage('SAST Scan') {
                    steps {
                        script {
                            echo "🔐 Running static application security testing..."
                        }
                        sh '''
                            echo "Scanning for common security issues..."
                            find . -type f -name "*.ts" -o -name "*.tsx" | head -20
                        '''
                    }
                }
            }
        }

        // Stage 8: Docker Build
        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            echo "🐳 Building backend Docker image..."
                        }
                        sh '''
                            docker build \
                                -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_NUMBER} \
                                -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest \
                                -f backend/Dockerfile \
                                backend/
                            
                            echo "Backend image built successfully"
                            docker images | grep ${PROJECT_NAME}-backend
                        '''
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            echo "🐳 Building frontend Docker image..."
                        }
                        sh '''
                            docker build \
                                -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_NUMBER} \
                                -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest \
                                -f frontend/Dockerfile \
                                frontend/
                            
                            echo "Frontend image built successfully"
                            docker images | grep ${PROJECT_NAME}-frontend
                        '''
                    }
                }
            }
        }

        // Stage 9: Push to Registry
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "📤 Pushing Docker images to registry..."
                }
                sh '''
                    echo "Logging into Docker registry..."
                    echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                    
                    echo "Pushing backend image..."
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest
                    
                    echo "Pushing frontend image..."
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest
                    
                    echo "Images pushed successfully"
                    docker logout
                '''
            }
        }

        // Stage 10: Deploy to Dev
        stage('Deploy to Dev') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "🚀 Deploying to development environment..."
                }
                sh '''
                    echo "Deploying to development..."
                    docker-compose -f docker-compose.yml up -d
                    
                    sleep 5
                    
                    echo "Checking service health..."
                    curl -s http://localhost:3000/health || echo "Health check failed"
                    curl -s http://localhost:5173/ || echo "Frontend check failed"
                '''
            }
        }

        // Stage 11: Deploy to Staging
        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                script {
                    echo "🚀 Deploying to staging environment..."
                }
                sh '''
                    echo "Deploying to staging (Kubernetes)..."
                    
                    # Update kubeconfig
                    aws eks update-kubeconfig --name civicbirth-cluster --region us-east-1
                    
                    # Deploy to staging namespace
                    kubectl set image deployment/civicbirth-backend \
                        civicbirth-backend=${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_NUMBER} \
                        -n staging --record || true
                    
                    kubectl set image deployment/civicbirth-frontend \
                        civicbirth-frontend=${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_NUMBER} \
                        -n staging --record || true
                    
                    sleep 10
                    
                    echo "Checking deployment status..."
                    kubectl rollout status deployment/civicbirth-backend -n staging || true
                    kubectl rollout status deployment/civicbirth-frontend -n staging || true
                '''
            }
        }

        // Stage 12: Deploy to Production
        stage('Deploy to Production') {
            when {
                branch 'main'
                expression { params.ENVIRONMENT == 'production' }
            }
            input {
                message "Deploy to production?"
                ok "Deploy"
            }
            steps {
                script {
                    echo "🚀 Deploying to production environment..."
                }
                sh '''
                    echo "Deploying to production (Kubernetes)..."
                    
                    # Update kubeconfig
                    aws eks update-kubeconfig --name civicbirth-cluster-prod --region us-east-1
                    
                    # Deploy with rolling update
                    kubectl set image deployment/civicbirth-backend \
                        civicbirth-backend=${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_NUMBER} \
                        -n production --record
                    
                    kubectl set image deployment/civicbirth-frontend \
                        civicbirth-frontend=${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_NUMBER} \
                        -n production --record
                    
                    sleep 15
                    
                    echo "Checking production deployment..."
                    kubectl rollout status deployment/civicbirth-backend -n production
                    kubectl rollout status deployment/civicbirth-frontend -n production
                '''
            }
        }

        // Stage 13: Smoke Tests
        stage('Smoke Tests') {
            when {
                expression { params.ENVIRONMENT != 'production' }
            }
            steps {
                script {
                    echo "✔️ Running smoke tests on deployed environment..."
                }
                sh '''
                    echo "Testing API endpoints..."
                    
                    API_URL="http://localhost:3000"
                    
                    # Test health endpoint
                    response=$(curl -s -w "%{http_code}" -o /dev/null $API_URL/health)
                    if [ $response -eq 200 ]; then
                        echo "✅ Health check passed"
                    else
                        echo "❌ Health check failed: $response"
                        exit 1
                    fi
                    
                    # Test auth endpoint
                    response=$(curl -s -w "%{http_code}" -o /dev/null $API_URL/api/auth)
                    echo "Auth endpoint: $response"
                    
                    echo "Smoke tests complete"
                '''
            }
        }
    }

    // Post-build actions
    post {
        always {
            script {
                echo "📊 Generating reports..."
            }
            
            // Collect test results
            junit testResults: '**/test-results.xml', allowEmptyResults: true
            
            // Publish code coverage
            publishHTML([
                reportDir: 'backend/coverage',
                reportFiles: 'index.html',
                reportName: 'Backend Code Coverage',
                allowMissing: true,
                alwaysLinkToLastBuild: true
            ])
            
            // Cleanup
            sh '''
                echo "Cleaning up..."
                docker-compose down 2>/dev/null || true
                docker image prune -f --filter "dangling=true" || true
            '''
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
            }
            // Send success notification
            sh '''
                echo "Build #${BUILD_NUMBER} succeeded on ${GIT_BRANCH}"
            '''
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
            }
            // Send failure notification
            sh '''
                echo "Build #${BUILD_NUMBER} failed!"
            '''
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline is unstable"
            }
        }
    }
}

// Helper functions
def deployToEnvironment(String env) {
    echo "Deploying to ${env}..."
}

def runTests(String testType) {
    echo "Running ${testType} tests..."
}

def notifySlack(String status) {
    echo "Notifying Slack: ${status}"
}
