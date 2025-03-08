import React, { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { urls } from '../../../../utils/constants';
import { useParams } from 'react-router-dom';
import { EventData } from '../../../../models/Event';
import { FlexColumn } from '../../../components/containers/Flex';
import { H3, H6 } from '../../../components/typography/Typography';
import dayjs from 'dayjs';
import { Button } from '@mui/material';

export function EventQRPage({ event, qrSize }: { event: EventData; qrSize: number }) {
    const url = useMemo(() => new URL(urls.event(event.eventId!), window.origin), [event]);
    const copyImage = async () => {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas.getContext('2d')!;
        let svgString = document.getElementById('qrData')!.innerHTML;

        let blob = new Blob([svgString], { type: 'image/svg+xml' });
        //convert svg to png so other apps can handle it
        const pngImage: Blob = await new Promise((resolve) => {
            const draw = () => {
                canvas.width = qrSize;
                canvas.height = qrSize;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => resolve(blob!));
            };
            let img = new Image();
            img.onerror = (err) => {
                console.error('Error loading image: ', err);
            };
            img.onload = draw;
            let objectURL = URL.createObjectURL(blob);
            img.src = objectURL;
        });
        console.log(pngImage);
        navigator.clipboard
            .write([
                new ClipboardItem({
                    'image/svg+xml': blob,
                    'image/png': pngImage
                })
            ])
            .then(() => {
                console.log('Copied!');
            })
            .catch((err) => {
                console.error('Error copying: ', err);
            });
    };
    return (
        <div>
            <canvas id="canvas" style={{ display: 'none' }} />
            <FlexColumn alignItems="center" fullWidth gap={30} style={{ padding: 60 }}>
                <H3>{event.name}</H3>
                <FlexColumn gap={5} alignItems="center">
                    <H6>{dayjs(event.eventDate).format('dddd MMMM DD, YYYY hh:mm a')}</H6>
                    <H6>{event.location}</H6>
                </FlexColumn>
                <div style={{ background: 'white', padding: 20 }} id="qrData">
                    <QRCode value={url.toString()} size={qrSize} />
                </div>
                <Button variant="text" onClick={() => copyImage()}>
                    <H6>Copy Image</H6>
                </Button>
            </FlexColumn>
        </div>
    );
}
