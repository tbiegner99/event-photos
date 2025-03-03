def remote = [:]
remote.name = 'tj-ubuntu-server'
remote.host = 'host.docker.internal'
remote.allowAnyHosts = true

pipeline {
    agent none

    stages {
     
        stage('Build') {
            parallel {
                stage("Build UI") {
                    agent {
                       docker "node:20"
                    }
                    steps {

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

                        dir("backend/event-photos") {
                            sh 'pwd'
                            sh 'npm ci'
                            sh 'npm run build'
                            
                            sh 'ls build'
                           stash includes: 'build/**', name: 'backend_build'
                           echo "BACKEND BUILD Complete..."

                        }
                        
                    }
                }
            }

        }
         stage('Migrate') {
            agent {
                docker {
                    dockerfile "database/event-photos"
                } 
            }
            environment {
                DATABASE_CREDS = credentials('DATABASE_CREDS')
                DATABASE_URL = "event-photos-db"
                DATABASE_PORT = "5432"
                DATABASE_SCHEMA = "event-photos"      
            }
            steps {
                dir("backend/event-photos") {
                    sh "liquibase update  --username=$DATABASE_CREDS_USR --password=$DATABASE_CREDS_PSW --url=jdbc:postgresql://$DATABASE_URL:$DATABASE_PORT/$DATABASE_SCHEMA --changelogFile=changelog-root.xml"
                    echo "Migration Complete..."
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
                                            remoteDirectory: 'vms/post-events/ui', 
                                            remoteDirectorySDF: false, 
                                            removePrefix: 'build', 
                                            sourceFiles: 'build/**/*'
                                            )
                                        ], 
                                        usePromotionTimestamp: false, 
                                        useWorkspaceInPromotion: false, 
                                        verbose: true
                                    )
                                ])
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
                        unstash 'backend_build'
                        withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'SECRETS_FILE')]) {
                            sshPublisher(
                            publishers: [
                                sshPublisherDesc(
                                    configName: 'tj-ubuntu-server', 
                                    transfers: [
                                        sshTransfer(
                                            cleanRemote: false, 
                                            excludes: '', 
                                            execCommand: '', 
                                            execTimeout: 120000, 
                                            flatten: false, 
                                            makeEmptyDirs: false, 
                                            noDefaultExcludes: false, 
                                            patternSeparator: '[, ]+', 
                                            remoteDirectory: 'vms/post-events', 
                                            remoteDirectorySDF: false, 
                                            removePrefix: 'backend/event-photos', 
                                            sourceFiles: "$SECRETS_FILE"
                                            )
                                            ], 
                                            usePromotionTimestamp: false, 
                                            useWorkspaceInPromotion: false, 
                                            verbose: false
                                            )
                                            ]
                                            )
                        }
                        sshPublisher(
                            publishers: [
                                sshPublisherDesc(
                                    configName: 'tj-ubuntu-server', 
                                    transfers: [
                                        sshTransfer(
                                            cleanRemote: false, 
                                            excludes: '', 
                                            execCommand: '', 
                                            execTimeout: 120000, 
                                            flatten: false, 
                                            makeEmptyDirs: false, 
                                            noDefaultExcludes: false, 
                                            patternSeparator: '[, ]+', 
                                            remoteDirectory: 'vms/post-events', 
                                            remoteDirectorySDF: false, 
                                            removePrefix: 'backend/event-photos', 
                                            sourceFiles: 'backend/event-photos/dockerfile'
                                            )
                                            ], 
                                            usePromotionTimestamp: false, 
                                            useWorkspaceInPromotion: false, 
                                            verbose: false
                                            )
                                            ]
                                            )
                        dir("backend/event-photos") {
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
                                            remoteDirectory: 'vms/post-events/backend', 
                                            remoteDirectorySDF: false, 
                                            removePrefix: 'build', 
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
                                command: '/mnt/media/post-events && docker-compose up --build -d'
                            )
                        }
                        echo "BACKEND DEPLOY Complete..."
                    }
                }
            }

        }
    }
}