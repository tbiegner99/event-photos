def remote = [:]
remote.name = 'tj-ubuntu-server'
remote.host = 'host.docker.internal'
remote.allowAnyHosts = true

pipeline {
    agent any
    environment {
        SSH_CREDS = credentials("build-server-ssh-user")
    }
    stages {
        stage("Setup") {
           
            steps {
                script {
                    remote.user = SSH_CREDS_USR
                    remote.password = SSH_CREDS_PSW
                }
                
              
            }
        }
        stage('Build') {
            parallel {
                stage("Build UI") {
                    agent {
                      docker "node:20"
                    }
                    environment {
                        BASE_PATH = "/events"
                    }
                    steps {
                        git(
                          credentialsId: "tj-github",
                          branch:"main",
                          url: "git@github.com:tbiegner99/event-photos.git"
                      )
                        dir("ui/event-photos") {
                            sh 'pwd'
                            sh 'npm ci'
                            sh 'npm run build'
                            echo "UI BUILD Complete..."
                            sh 'ls build'
                          stash includes: 'build/**', name: 'ui_build'
                        }


                    }
                }

                 stage("Build Backend") {
                    agent {
                      docker "node:20"
                    }
                    steps {
                          
                          echo "BACKEND BUILD Not needed..."
                    }
                }
            }

        }
         stage('Migrate') {
            agent {
                docker {
                    image 'liquibase/liquibase'
                    args '--entrypoint= -u 0 --network=host'
                    reuseNode true
                }
            }
            environment {
                DATABASE_CREDS = credentials('DATABASE_CREDS')
                DATABASE_URL = "postgres"
                DATABASE_PORT = "5432"
                DATABASE_SCHEMA = "event-photos"      
            }
            steps {
                  git(
                          credentialsId: "tj-github",
                          branch:"main",
                          url: "git@github.com:tbiegner99/event-photos.git"
                      )
                script {
                    dir("database/event-photos") {
                        sh "pwd"
                        sh "ls"
                        sh "ls changelogs"
                        sh "/liquibase/liquibase update --username=$DATABASE_CREDS_USR --password=$DATABASE_CREDS_PSW --url=jdbc:postgresql://$DATABASE_URL:$DATABASE_PORT/$DATABASE_SCHEMA --changelogFile=changelog-root.xml"
                    }
                }
               
            }

        }
         stage('Deploy') {

            failFast true
            parallel {
                stage("Deploy UI") {
                    agent {
                      docker "alpine:3"
                    }
                  
                    steps {
                        unstash 'ui_build'
                        dir("ui/event-photos") {
                            sh 'ls build'
                            sshPublisher(publishers: [
                                sshPublisherDesc(
                                    configName: 'tj-ubuntu-server', 
                                    transfers: [
                                        sshTransfer(
                                            cleanRemote: false, 
                                            excludes: '', 
                                            execCommand: '', 
                                            execTimeout: 120000, 
                                            flatten: false, 
                                            makeEmptyDirs: true, 
                                            noDefaultExcludes: false, 
                                            patternSeparator: '[, ]+', 
                                            remoteDirectory: 'vms/event-photos/ui', 
                                            remoteDirectorySDF: false, 
                                            removePrefix: "build",
                                            sourceFiles: 'build/**/*'
                                            )
                                        ], 
                                        usePromotionTimestamp: false, 
                                        useWorkspaceInPromotion: false, 
                                        verbose: true
                                    )
                                ])
                            sshCommand(
                                remote: remote,
                                command: 'cd /mnt/media/vms/event-photos && docker restart webroot'
                            )
                            echo "UI DEPLOY Complete..."
                        }
                    }
                }

                 stage("Deploy Backend") {
                     agent {
                      docker "alpine:3"
                    }
                      environment {
                        DATABASE_URL = "event-photos-db"
                        DATABASE_PORT = "5432"
                        DATABASE_SCHEMA = "event-photos"
                        SUPERTOKENS_CONNECTION_URI = "https://st-dev-8caae1a0-e9bb-11ef-ba64-95a903bab5ec.aws.supertokens.io"
                        GOOGLE_CLOUD_PROJECT_ID = "event-photos-377222"
                        GOOGLE_BUCKET_NAME = "event-photos.tjbiegner.com"
                        GOOGLE_BUCKET_PUBLIC_URL = "https://storage.googleapis.com/event-photos.tjbiegner.com"
                    }
                    steps {
                        withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'SECRETS_FILE')]) {
                            sshPublisher(
                                publishers: [
                                    sshPublisherDesc(
                                        configName: 'tj-ubuntu-server', 
                                        transfers: [
                                            sshTransfer(
                                                cleanRemote: true, 
                                                excludes: 'backend/event-photos/node_modules/**/*', 
                                                execCommand: '', 
                                                execTimeout: 120000, 
                                                flatten: false, 
                                                makeEmptyDirs: true, 
                                                noDefaultExcludes: false, 
                                                patternSeparator: '[, ]+', 
                                                remoteDirectory: 'vms/event-photos/backend', 
                                                remoteDirectorySDF: false, 
                                                sourceFiles: 'backend/event-photos/*, backend/event-photos/src/**/*',
                                                removePrefix:"backend/event-photos"
                                            ),
                                            sshTransfer(
                                                remoteDirectory: 'vms/event-photos', 
                                                sourceFiles: "\$SECRETS_FILE"
                                            ),
                                            sshTransfer(
                                                cleanRemote: false, 
                                                flatten: false, 
                                                makeEmptyDirs: false, 
                                                noDefaultExcludes: false, 
                                                patternSeparator: '[, ]+', 
                                                remoteDirectory: 'vms/event-photos/backend', 
                                                remoteDirectorySDF: false, 
                                                removePrefix: 'backend/event-photos', 
                                                sourceFiles: 'backend/event-photos/dockerfile'
                                            )
                                            
                                        ], 
                                        usePromotionTimestamp: false, 
                                        useWorkspaceInPromotion: false, 
                                        verbose: true
                                    )
                                ]
                            )
                        }
                        sshCommand(
                            remote: remote,
                            command: 'cd /mnt/media/vms && docker compose up  -d --build event-photos && docker restart webroot'
                        )
                        echo "BACKEND DEPLOY Complete..."
                    }
                }
            }

        }
    }
    post {
        always {
        cleanWs()
        }
    }
}