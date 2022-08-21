package com.oney.WebRTCModule;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.segmentation.Segmentation;
import com.google.mlkit.vision.segmentation.SegmentationMask;
import com.google.mlkit.vision.segmentation.Segmenter;
import com.google.mlkit.vision.segmentation.selfie.SelfieSegmenterOptions;

import java.io.IOException;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutionException;

public class ImageProcessor implements BitmapProcessor {
    // Configure Selfie Segmenter
    private SelfieSegmenterOptions options = new SelfieSegmenterOptions.Builder()
            .setDetectorMode(SelfieSegmenterOptions.STREAM_MODE)
            .build();
    private Segmenter segmenter = Segmentation.getClient(options);
    private Bitmap bgImage;

    public ImageProcessor() {
        bgImage = null;
        // bgImage =
        // getBitmapFromUrl("https://images.unsplash.com/photo-1506371712237-a03dca697e2e");
    }

    public ImageProcessor(String url) {
        if (url != null)
            bgImage = getBitmapFromUrl(url);
        else
            bgImage = null;
    }

    private Bitmap getBitmapFromUrl(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            Bitmap image = BitmapFactory.decodeStream(url.openConnection().getInputStream());
            return image;
        } catch (IOException e) {
            System.out.println(e);
            return null;
        }
    }

    @Override
    public Bitmap process(Bitmap bitmap, String name) {

        InputImage inputImage = InputImage.fromBitmap(bitmap, 0);
        // process the mask
        try {
            Task<SegmentationMask> result = segmenter.process(inputImage);
            SegmentationMask mask = Tasks.await(result);
            switch (name) {
                case "blur":
                    return blurBackground(bitmap, mask);
                case "changeBg":
                    return changeBg(bitmap, mask);
                default:
                    return bitmap;
            }

        } catch (

        ExecutionException e) {
            // The Task failed, this is the same exception you'd get in a non-blocking
            // failure handler.
            return null;
        } catch (InterruptedException e) {
            // An interrupt occurred while waiting for the task to complete.
            return null;
        }
    }

    private Bitmap changeBg(Bitmap bitmap, SegmentationMask mask) {
        if (bgImage == null)
            return bitmap;
        ByteBuffer bufferMask = mask.getBuffer();
        int width = mask.getWidth();
        int height = mask.getHeight();
        if (bgImage.getWidth() != width || bgImage.getHeight() != height) {
            bgImage = Bitmap.createScaledBitmap(bgImage, width, height, false);
        }
        double backgroundLikelihood = 0;
        int length = width * height;
        int[] pixels = new int[width * height];
        int[] bgImagePixels = new int[width * height];
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
        bgImage.getPixels(bgImagePixels, 0, width, 0, 0, width, height);

        for (int i = 0; i < length; i++) {
            // gets the likely hood of the background for this pixel
            backgroundLikelihood = 1 - bufferMask.getFloat();
            // sets the pixel if background using gaussian blur technique
            if (backgroundLikelihood > .2) {
                pixels[i] = bgImagePixels[i];
            }

        }

        bitmap.setPixels(pixels, 0, width, 0, 0, width, height);

        return bitmap;

    }

    private Bitmap blurBackground(Bitmap bitmap, SegmentationMask mask) {

        ByteBuffer bufferMask = mask.getBuffer();
        int width = mask.getWidth();
        int height = mask.getHeight();
        double backgroundLikelihood = 0;
        // int length = width * height;
        int[] pixels = new int[width * height];
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
        // the radius for gaussian blur
        int r = 4;
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                // gets the likely hood of the background for this pixel
                backgroundLikelihood = 1 - bufferMask.getFloat();
                // sets the pixel if background using gaussian blur technique
                if (backgroundLikelihood > .2) {
                    if (i >= r && j >= r && i < height - r && j < width - r) {

                        int tl = pixels[(i - r) * width + j - r];
                        int tr = pixels[(i - r) * width + j + r];
                        int tc = pixels[(i - r) * width + j];
                        int bl = pixels[(i + r) * width + j - r];
                        int br = pixels[(i + r) * width + j + r];
                        int bc = pixels[(i + r) * width + j];
                        int cl = pixels[i * width + j - r];
                        int cr = pixels[i * width + j + r];

                        pixels[(i * width) + j] = 0xFF000000 |
                                (((tl & 0xFF) + (tr & 0xFF) + (tc & 0xFF) + (bl & 0xFF) + (br & 0xFF) + (bc &
                                        0xFF)
                                        + (cl & 0xFF) + (cr & 0xFF)) >> 3) & 0xFF
                                |
                                (((tl & 0xFF00) + (tr & 0xFF00) + (tc & 0xFF00) + (bl & 0xFF00) + (br &
                                        0xFF00)
                                        + (bc & 0xFF00) + (cl & 0xFF00) + (cr & 0xFF00)) >> 3) & 0xFF00
                                |
                                (((tl & 0xFF0000) + (tr & 0xFF0000) + (tc & 0xFF0000) + (bl & 0xFF0000)
                                        + (br & 0xFF0000)
                                        + (bc & 0xFF0000) + (cl & 0xFF0000) + (cr & 0xFF0000)) >> 3) & 0xFF0000;
                    }
                }
            }
        }

        bitmap.setPixels(pixels, 0, width, 0, 0, width, height);

        return bitmap;

    }

}

// // gaussian blur of image
// static void blurfast(Bitmap bmp, int radius) {
// int w = bmp.getWidth();
// int h = bmp.getHeight();
// int[] pix = new int[w * h];
// bmp.getPixels(pix, 0, w, 0, 0, w, h);
// int r = radius;
// for (int i = r; i < h - r; i++) {
// for (int j = r; j < w - r; j++) {
// if (i >= r && j >= r && i < h - r && j < w - r) {

// int tl = pix[(i - r) * w + j - r];
// int tr = pix[(i - r) * w + j + r];
// int tc = pix[(i - r) * w + j];
// int bl = pix[(i + r) * w + j - r];
// int br = pix[(i + r) * w + j + r];
// int bc = pix[(i + r) * w + j];
// int cl = pix[i * w + j - r];
// int cr = pix[i * w + j + r];

// pix[(i * w) + j] = 0xFF000000 |
// (((tl & 0xFF) + (tr & 0xFF) + (tc & 0xFF) + (bl & 0xFF) + (br & 0xFF) + (bc &
// 0xFF)
// + (cl & 0xFF) + (cr & 0xFF)) >> 3) & 0xFF
// |
// (((tl & 0xFF00) + (tr & 0xFF00) + (tc & 0xFF00) + (bl & 0xFF00) + (br &
// 0xFF00)
// + (bc & 0xFF00) + (cl & 0xFF00) + (cr & 0xFF00)) >> 3) & 0xFF00
// |
// (((tl & 0xFF0000) + (tr & 0xFF0000) + (tc & 0xFF0000) + (bl & 0xFF0000)
// + (br & 0xFF0000)
// + (bc & 0xFF0000) + (cl & 0xFF0000) + (cr & 0xFF0000)) >> 3) & 0xFF0000;
// }
// }

// }

// bmp.setPixels(pix, 0, w, 0, 0, w, h);
// }
