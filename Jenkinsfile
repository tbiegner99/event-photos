pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }
        stage('Build') {
            parallel {
                stage("Build UI") {
                    agent {
                       docker "node:20"
                    }
                    steps {

                        dir("ui/event-photos") {
                            sh 'pwd'
                            sh 'ls'
                            sh 'npm i'
                            sh 'npm run build'
                            echo "UI BUILD Complete..."
                            sh 'ls build'
                           stash includes: 'build/**', name: 'ui_build'
                        }


                    }
                }

                 stage("Build Backend") {
                    steps {

                        dir("server") {
                            sh 'docker build .'

                        }
                        echo "BACKEND BUILD Complete..."
                    }
                }
            }

        }
         stage('Migrate') {

            steps {
                echo "Migration Complete..."
            }

        }
         stage('Deploy') {

            failFast true
            parallel {
                stage("Deploy UI") {
                    steps {
                        unstash 'ui_build'
                        sh 'ls build'
                        sshPublisher(publishers: [sshPublisherDesc(configName: 'tj-ubuntu-server', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/media/vms/post-events', remoteDirectorySDF: false, removePrefix: 'ui/event-photos/build', sourceFiles: 'ui/event-photos/build/**/*')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                        echo "UI DEPLOY Complete..."
                    }
                }

                 stage("Deploy Baackend") {
                    steps {
                        echo "BACKEND DEPLOY Complete..."
                        sshPublisher(publishers: [sshPublisherDesc(configName: 'tj-ubuntu-server', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/media/vms/post-events', remoteDirectorySDF: false, removePrefix: 'backend/event-photos', sourceFiles: 'backend/event-photos/dockerfile')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                        sshagent(credentials: ['tj-ubuntu-server']) {
                            sh "cd /media/vms/post-events"
                            sh "echo `pwd`"
                            sh "docker-compose up -d"
                        }
                    }
                }
            }

        }
    }
}