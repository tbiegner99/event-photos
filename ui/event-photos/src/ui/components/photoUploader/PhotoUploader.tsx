import React, { useEffect, useRef } from 'react';
import styles from './photoUploader.css';
import { Badge, Box, Button, CircularProgress, Drawer, Fab, Typography } from '@mui/material';
import { FlexColumn, FlexRow } from '../containers/Flex';
import {
    Check,
    Circle,
    Close,
    LocalOffer,
    Person,
    PersonAdd,
    PersonAddAlt,
    PhotoCamera,
    Square,
    Sync
} from '@mui/icons-material';
import { useGesture, usePinch } from '@use-gesture/react';
import combineClasses from 'classnames';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { AddTagModal } from '../../pages/public/event/photoGallery/addTagModal/AddTagModal';
import { meta } from 'eslint-plugin-prettier';
import { Services } from '../../../dependencies';

dayjs.extend(duration);

export const PhotoUploader = ({
    eventId,
    onUploadImage,
    onUploadVideo,
    onClose
}: {
    eventId: string;
    onClose: () => void;
    onUploadImage: (image: Blob, metadata: any) => Promise<any>;
    onUploadVideo: (video: Blob, metadata: any) => Promise<any>;
}) => {
    const [metadata, setMetadata] = React.useState<any>({
        keywords: [],
        people: []
    });
    const [addingTag, setAddingTag] = React.useState(false);
    const [addingPeople, setAddingPeople] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [videoSize, setVideoSize] = React.useState<[number, number]>([0, 0]);
    const [isRecording, setIsRecording] = React.useState(false);
    const [stream, setStream] = React.useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('environment');
    const [image, setImage] = React.useState<string | null>(null);
    const imageData = React.useRef<Blob | null>(null);
    const recordingTimer = React.useRef<number | null>(null);
    const startRecordingTime = React.useRef<number | null>(null);
    const [recordingTime, setRecordingTime] = React.useState<number | null>(null);
    const video = React.useRef<Blob | null>(null);
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
    const recordedData = React.useRef<Blob[] | null>(null);
    const mediaRecorder = React.useRef<MediaRecorder | null>(null);
    const [currentZoom, setCurrentZoom] = React.useState(1);
    const [ready, setReady] = React.useState(false);
    const [zoombounds, setZoombounds] = React.useState<{
        minZoom: number;
        maxZoom: number;
    } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tagOptions, setTagOptions] = React.useState<{ label: string; value: string }[]>([]);
    const [photoOptions, setPhotOptions] = React.useState<{ label: string; value: string }[]>([]);
    const loadTags = async () => {
        const tags = await Services.events.getUniqueTags(eventId);
        setTagOptions(
            tags.map((t) => ({
                label: t,
                value: t
            }))
        );
    };
    const loadPeople = async () => {
        const tags = await Services.events.getUniquePeople(eventId);
        setPhotOptions(
            tags.map((t) => ({
                label: t,
                value: t
            }))
        );
    };
    useEffect(() => {
        if (eventId) {
            loadTags();
            loadPeople();
        }
    }, [eventId]);
    const startRecording = () => {
        var options = { mimeType: 'video/webm;codecs=vp9', bitsPerSecond: 16000000 };
        const recorder = new MediaRecorder(stream!, options);
        recorder.ondataavailable = onDataReceived;
        mediaRecorder.current = recorder;
        recordedData.current = [];
        startRecordingTime.current = Date.now();
        setRecordingTime(0);
        recorder.start(10);
        recordingTimer.current = window.setInterval(() => {
            setRecordingTime(Date.now() - startRecordingTime.current!);
        }, 10);
    };
    const stopRecording = () => {
        mediaRecorder.current?.stop();
        const blob = new Blob(recordedData.current!, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        video.current = blob;
        recordedData.current = null;
        setVideoUrl(url);
        clearInterval(recordingTimer.current!);
    };
    const onDataReceived = (event: BlobEvent) => {
        recordedData.current?.push(event.data);
    };
    const takePicture = () => {
        let canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        context!.imageSmoothingQuality = 'high';
        context!.imageSmoothingEnabled = true;
        if (videoSize) {
            canvas.width = videoRef.current!.videoWidth;
            canvas.height = videoRef.current!.videoHeight;
            const startTime = Date.now();
            context!.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
            console.log('Draw time', Date.now() - startTime);
            setImage('image/png');
            console.log('Url time', Date.now() - startTime);
        } else {
            setImage(null);
        }
    };
    const getCanvasData = () => {
        return new Promise<Blob>((resolve) => {
            const startTime = Date.now();
            canvasRef.current!.toBlob((blob) => {
                imageData.current = blob;
                console.log('Blob time', Date.now() - startTime);
                setImage(URL.createObjectURL(blob!));
                resolve(blob!);
            });
        });
    };
    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    };
    useEffect(() => {
        const handler = (e: Event) => e.preventDefault();
        document.addEventListener('gesturestart', handler);
        document.addEventListener('gesturechange', handler);
        document.addEventListener('gestureend', handler);
        return () => {
            stopStream();
            document.removeEventListener('gesturestart', handler);
            document.removeEventListener('gesturechange', handler);
            document.removeEventListener('gestureend', handler);
        };
    }, []);
    useEffect(() => {
        if (image === null && videoUrl === null) {
            console.log(navigator.mediaDevices.getSupportedConstraints());
            stopStream();
            setReady(false);
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode
                    } as any,
                    audio: true
                })
                .then(function (stream) {
                    setStream(stream);

                    const capabilities: MediaTrackCapabilities & { zoom?: any } = stream
                        .getVideoTracks()[0]
                        .getCapabilities();
                    if ((capabilities as any).zoom) {
                        setZoombounds({
                            minZoom: capabilities.zoom.min,
                            maxZoom: capabilities.zoom.max
                        });
                    }
                    reset();
                    setReady(true);
                });
        }
    }, [facingMode, image, videoUrl]);
    useEffect(() => {
        if (videoRef.current && stream) {
            const video: any = videoRef.current;
            const maxSize = [
                stream.getVideoTracks()[0].getCapabilities().width?.max || 0,
                stream.getVideoTracks()[0].getCapabilities().height?.max || 0
            ] as any;
            setVideoSize(maxSize);
            stream.getVideoTracks()[0].applyConstraints({
                width: maxSize[0],
                height: maxSize[1]
            } as any);
            video.srcObject = stream;
            console.log(stream.getVideoTracks()[0].getCapabilities());
            video.play();
        }
    }, [videoRef, stream]);
    useEffect(() => {
        stream?.getVideoTracks()[0].applyConstraints({
            advanced: [{ zoom: currentZoom }]
        } as any);
    }, [currentZoom]);
    useGesture(
        {
            onDrag: ({ pinching, cancel, offset: [x, y], ...rest }) => {
                if (pinching) return cancel();
            },
            onPinch: ({ origin, first, movement, offset, memo }) => {
                if (first) {
                    return currentZoom;
                }
                const [scale] = movement;
                let newZoom = Math.floor(memo * scale * 10) / 10;
                if (zoombounds) {
                    newZoom = Math.min(Math.max(newZoom, zoombounds.minZoom), zoombounds.maxZoom);
                }

                setCurrentZoom(newZoom);
                return memo;
            }
        },
        {
            threshold: 10,
            target: videoRef
        }
    );
    const reset = () => {
        stopStream();
        video.current = null;
        imageData.current = null;
        setRecordingTime(null);
        startRecordingTime.current = null;
        setImage(null);
        setVideoUrl(null);
    };
    const renderPreview = () => {
        if (image) {
            return null;
        } else if (videoUrl) {
            return (
                <video
                    key="playback"
                    src={videoUrl}
                    className={styles.media}
                    controls
                    playsInline
                ></video>
            );
        } else {
            return (
                <video
                    key="record"
                    ref={videoRef}
                    muted
                    className={styles.media}
                    autoPlay
                    playsInline
                ></video>
            );
        }
    };
    const formatRecordingTime = (time: number) => {
        const duration = dayjs.duration(time);
        if (duration.hours() > 0) {
            return duration.format('H:mm:ss.SSS');
        } else {
            return duration.format('mm:ss.SSS');
        }
    };

    const renderToolBar = () => {
        return image == null && videoUrl == null ? (
            <>
                <Fab disabled={isRecording} onClick={onClose}>
                    <Close />
                </Fab>
                <Fab disabled={isRecording || !ready} onClick={() => takePicture()}>
                    <PhotoCamera />
                </Fab>
                <Fab
                    disabled={!ready}
                    onClick={() => {
                        if (isRecording) {
                            stopRecording();
                        } else {
                            startRecording();
                        }
                        setIsRecording(!isRecording);
                    }}
                >
                    {isRecording ? <Square /> : <Circle htmlColor="#cc0000" />}
                </Fab>

                <Fab
                    disabled={isRecording || !ready}
                    onClick={() => {
                        stopStream();
                        setStream(null);
                        setFacingMode(facingMode === 'user' ? 'environment' : 'user');
                    }}
                >
                    <Sync />
                </Fab>
            </>
        ) : (
            <>
                <Fab
                    disabled={isUploading}
                    onClick={async () => {
                        setIsUploading(true);

                        try {
                            if (image) {
                                const blob = await getCanvasData();
                                await onUploadImage(blob, metadata);
                            } else if (videoUrl) {
                                await onUploadVideo(video.current!, metadata);
                            }
                            reset();
                        } catch (e) {
                            setIsUploading(false);
                        }
                    }}
                >
                    <Check />
                </Fab>
                <Badge showZero badgeContent={metadata.keywords.length} color={'primary'}>
                    <Fab
                        disabled={isUploading}
                        onClick={async () => {
                            setAddingTag(true);
                        }}
                    >
                        <LocalOffer />
                    </Fab>
                </Badge>
                <Badge showZero badgeContent={metadata.people.length} color={'primary'}>
                    <Fab
                        disabled={isUploading}
                        onClick={async () => {
                            setAddingPeople(true);
                        }}
                    >
                        <PersonAdd />
                    </Fab>
                </Badge>
                <Fab onClick={() => reset()}>
                    <Close />
                </Fab>
            </>
        );
    };
    return (
        <>
            <AddTagModal
                options={tagOptions}
                open={addingTag}
                onAddTag={async (tag) => {
                    setMetadata({
                        ...metadata,
                        keywords: [...metadata.keywords, tag]
                    });
                    loadTags();
                }}
                onRemoveTag={async (tag) => {
                    const newTags = metadata.keywords.filter((t) => t !== tag);
                    setMetadata({
                        ...metadata,
                        keywords: newTags
                    });
                }}
                tags={metadata.keywords}
                title="Add Tags"
                tagIcon={<LocalOffer style={{ fontSize: 18 }} />}
                onDone={() => {
                    setAddingTag(false);
                }}
            />
            <AddTagModal
                options={photoOptions}
                open={addingPeople}
                onAddTag={async (tag) => {
                    setMetadata({
                        ...metadata,
                        people: [...metadata.people, tag]
                    });
                    loadPeople();
                }}
                onRemoveTag={async (tag) => {
                    const newTags = metadata.people.filter((t) => t !== tag);
                    setMetadata({
                        ...metadata,
                        people: newTags
                    });
                }}
                tags={metadata.people}
                title="Add People"
                tagIcon={<Person style={{ fontSize: 18 }} />}
                onDone={() => {
                    setAddingPeople(false);
                }}
            />
            <Drawer open={true} anchor={'right'} variant={'persistent'}>
                <FlexColumn className={styles.mediaContainer}>
                    <canvas
                        key={'canvas'}
                        ref={canvasRef}
                        className={styles.pictureCanvas}
                        style={{
                            display: image ? 'block' : 'none'
                        }}
                    ></canvas>
                    {renderPreview()}

                    <FlexRow justifyContent="space-evenly" alignItems="center" grow={1}>
                        <FlexColumn
                            grow={1}
                            alignItems="center"
                            justifyContent="center"
                            className={combineClasses({
                                [styles.hidden]: Boolean(image || videoUrl)
                            })}
                            gap={5}
                        >
                            <Typography color="white">Zoom</Typography>
                            <Typography color="white">x{currentZoom}</Typography>
                        </FlexColumn>
                        <FlexColumn grow={1} alignItems="center" justifyContent="center" gap={5}>
                            {recordingTime !== null && (
                                <>
                                    <Typography color="white">Time</Typography>
                                    <Typography color="white">
                                        {formatRecordingTime(recordingTime)}
                                    </Typography>
                                </>
                            )}
                        </FlexColumn>
                        <FlexColumn grow={1} />
                    </FlexRow>
                    <FlexRow
                        grow={1}
                        className={styles.footerControls}
                        justifyContent={'space-evenly'}
                        alignItems="flex-start"
                    >
                        {isUploading ? <CircularProgress /> : renderToolBar()}
                    </FlexRow>
                </FlexColumn>
            </Drawer>
        </>
    );
};
