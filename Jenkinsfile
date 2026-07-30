def BACKEND_SERVICES = [
  'eureka-server',
  'api-gateway',
  'identity-service',
  'product-service',
  'inventory-service',
  'order-service',
  'customer-service',
  'staff-service',
  'notification-service',
  'report-service'
]

def FRONTEND_SERVICE = 'smms-frontend'

def imageRepoFor(String service) {
  return service == 'smms-frontend' ? 'frontend' : service
}

def backendTestEnvFor(String service) {
  def common = [
    'EUREKA_CLIENT_ENABLED=false',
    'EUREKA_CLIENT_REGISTER_WITH_EUREKA=false',
    'EUREKA_CLIENT_FETCH_REGISTRY=false',
    'JWT_SECRET=T7EOnmBnmqvRABNZf9TsmuHLyFmauuAV66Nd8OdaTlFLBTocK2nH0NKIcwLpjJAosgGs8tV2BuuIQ2doKjiFfA==',
    'JWT_REFRESH=T9EOnmBnmqvRABNZf9TsmuHLyFmauuAV66Nd8OdaTlFLBTocK2nH0NKIcwLpjJAosgGs8tV2BuuIQ2doKjiFfA==',
    'KAFKA_BOOTSTRAP_SERVERS=localhost:9092',
    'MAIL_HOST=localhost',
    'MAIL_PORT=1025',
    'MAIL_USERNAME=ci@example.com',
    'MAIL_PASSWORD=ci'
  ]

  def perService = [
    'identity-service': [
      'SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/smms_identity_service',
      'SPRING_DATASOURCE_USERNAME=root',
      'SPRING_DATASOURCE_PASSWORD=12345',
      'SPRING_REDIS_HOST=localhost',
      'SPRING_REDIS_PORT=6379'
    ],
    'staff-service': [
      'SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/smms_staff_service',
      'SPRING_DATASOURCE_USERNAME=root',
      'SPRING_DATASOURCE_PASSWORD=12345'
    ],
    'product-service': [
      'MONGO_URI=mongodb://root:12345@localhost:27017/smms_product_service?authSource=admin'
    ],
    'notification-service': [
      'MONGO_URI=mongodb://root:12345@localhost:27017/smms_notification_service?authSource=admin'
    ],
    'inventory-service': [
      'DB_URL=jdbc:postgresql://localhost:5433/smms_inventory_service',
      'DB_USER=postgres',
      'DB_PASSWORD=12345'
    ],
    'order-service': [
      'DB_URL=jdbc:postgresql://localhost:5433/smms_order_service',
      'DB_USER=postgres',
      'DB_PASSWORD=12345'
    ],
    'customer-service': [
      'DB_URL=jdbc:postgresql://localhost:5433/smms_customer_service',
      'DB_USER=postgres',
      'DB_PASSWORD=12345'
    ],
    'report-service': [
      'DB_URL=jdbc:postgresql://localhost:5433/smms_report_service',
      'DB_USER=postgres',
      'DB_PASSWORD=12345'
    ]
  ]

  return common + perService.get(service, [])
}

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    string(name: 'DOCKERHUB_NAMESPACE', defaultValue: 'smms', description: 'DockerHub username or organization that owns the image repositories')
    string(name: 'MAIN_BRANCH', defaultValue: 'main', description: 'Branch allowed to push images to DockerHub')
    booleanParam(name: 'PUSH_IMAGES', defaultValue: true, description: 'Push Docker images only when this build is running on MAIN_BRANCH')
    booleanParam(name: 'RUN_SONAR', defaultValue: true, description: 'Run SonarQube analysis and enforce the quality gate')
    string(name: 'SONARQUBE_SERVER', defaultValue: 'SonarQube', description: 'Jenkins SonarQube server configuration name')
    string(name: 'SONAR_SCANNER_TOOL', defaultValue: 'SonarScanner', description: 'Jenkins SonarScanner tool installation name')
    string(name: 'VITE_API_URL', defaultValue: 'http://localhost:8080', description: 'API Gateway URL baked into the frontend image')
  }

  environment {
    COMPOSE_DOCKER_CLI_BUILD = '1'
    COMPOSE_FILE_CI = 'ci/docker-compose.dependencies.yml'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Init') {
      steps {
        script {
          def namespace = params.DOCKERHUB_NAMESPACE.trim().toLowerCase()
          if (!namespace) {
            error 'DOCKERHUB_NAMESPACE must be set to your DockerHub username or organization.'
          }

          def detectedBranch = env.BRANCH_NAME
          if (!detectedBranch?.trim()) {
            detectedBranch = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
          }
          if (!detectedBranch?.trim() || detectedBranch == 'HEAD') {
            detectedBranch = 'detached'
          }

          env.CI_BRANCH = detectedBranch
          env.BRANCH_SAFE = detectedBranch.replaceAll(/[^A-Za-z0-9_.-]/, '-')
          env.GIT_SHA = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BRANCH_SAFE}-${env.BUILD_NUMBER}-${env.GIT_SHA}"
          env.IMAGE_PREFIX = "docker.io/${namespace}"
          env.IS_MAIN_BRANCH = (detectedBranch == params.MAIN_BRANCH).toString()
          env.SHOULD_PUSH_IMAGES = (params.PUSH_IMAGES && detectedBranch == params.MAIN_BRANCH).toString()
          env.COMPOSE_PROJECT_NAME = "smms-ci-${env.BUILD_NUMBER}"
          env.DOCKER_CONFIG = "${env.WORKSPACE}/.docker"

          echo "Branch: ${env.CI_BRANCH}"
          echo "Image prefix: ${env.IMAGE_PREFIX}"
          echo "Image tag: ${env.IMAGE_TAG}"
          echo "Push images: ${env.SHOULD_PUSH_IMAGES}"
          sh 'mkdir -p "$DOCKER_CONFIG"'
        }
      }
    }

    stage('Start CI dependencies') {
      steps {
        script {
          try {
            sh 'docker compose -f "$COMPOSE_FILE_CI" up -d --wait'
          } catch (err) {
            sh 'docker compose -f "$COMPOSE_FILE_CI" ps || true'
            sh 'docker compose -f "$COMPOSE_FILE_CI" logs --no-color --tail=200 kafka || true'
            sh '''
              KAFKA_CONTAINER="$(docker compose -f "$COMPOSE_FILE_CI" ps -q kafka)"
              if [ -n "$KAFKA_CONTAINER" ]; then
                docker inspect --format='{{json .State.Health}}' "$KAFKA_CONTAINER" || true
              fi
            '''
            throw err
          }
        }
      }
    }

    stage('Backend tests') {
      steps {
        script {
          def branches = [:]
          BACKEND_SERVICES.each { service ->
            branches[service] = {
              dir(service) {
                withEnv(backendTestEnvFor(service)) {
                  sh 'chmod +x mvnw'
                  sh './mvnw -B -ntp test'
                }
              }
            }
          }
          parallel branches
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: '*/target/surefire-reports/*.xml'
        }
      }
    }

    stage('Frontend lint and build') {
      steps {
        dir(FRONTEND_SERVICE) {
          sh 'npm ci'
          sh 'npm run lint'
          sh 'npm run build'
        }
      }
    }

    stage('SonarQube analysis') {
      when {
        expression { return params.RUN_SONAR }
      }
      steps {
        script {
          def scannerHome = tool params.SONAR_SCANNER_TOOL
          withSonarQubeEnv(params.SONARQUBE_SERVER) {
            sh """
              "${scannerHome}/bin/sonar-scanner" -Dsonar.projectVersion="${env.IMAGE_TAG}"
            """
          }
        }
      }
    }

    stage('Quality gate') {
      when {
        expression { return params.RUN_SONAR }
      }
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build Docker images') {
      steps {
        script {
          def services = BACKEND_SERVICES + [FRONTEND_SERVICE]
          def branches = [:]
          services.each { service ->
            branches[service] = {
              def repo = imageRepoFor(service)
              def immutableImage = "${env.IMAGE_PREFIX}/${repo}:${env.IMAGE_TAG}"
              def branchImage = "${env.IMAGE_PREFIX}/${repo}:${env.BRANCH_SAFE}"
              def latestImage = "${env.IMAGE_PREFIX}/${repo}:latest"
              def tagArgs = "-t ${immutableImage} -t ${branchImage}"
              def buildArgs = ''

              if (env.IS_MAIN_BRANCH == 'true') {
                tagArgs = "${tagArgs} -t ${latestImage}"
              }
              if (service == FRONTEND_SERVICE) {
                buildArgs = "--build-arg VITE_API_URL='${params.VITE_API_URL}'"
              }

              sh "docker build ${buildArgs} ${tagArgs} ${service}"
            }
          }
          parallel branches
        }
      }
    }

    stage('DockerHub login') {
      when {
        expression { return env.SHOULD_PUSH_IMAGES == 'true' }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
          sh 'printf "%s" "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin'
        }
      }
    }

    stage('Push DockerHub images') {
      when {
        expression { return env.SHOULD_PUSH_IMAGES == 'true' }
      }
      steps {
        script {
          def services = BACKEND_SERVICES + [FRONTEND_SERVICE]
          def branches = [:]
          services.each { service ->
            branches[service] = {
              def repo = imageRepoFor(service)
              sh "docker push ${env.IMAGE_PREFIX}/${repo}:${env.IMAGE_TAG}"
              sh "docker push ${env.IMAGE_PREFIX}/${repo}:${env.BRANCH_SAFE}"
              sh "docker push ${env.IMAGE_PREFIX}/${repo}:latest"
            }
          }
          parallel branches
        }
      }
    }
  }

  post {
    always {
      sh 'docker compose -f "$COMPOSE_FILE_CI" down -v --remove-orphans || true'
      sh 'docker logout || true'
      cleanWs(deleteDirs: true, disableDeferredWipeout: true)
    }
  }
}
