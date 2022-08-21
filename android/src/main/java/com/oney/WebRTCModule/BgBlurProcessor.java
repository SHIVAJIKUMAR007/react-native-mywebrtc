package com.oney.WebRTCModule;

import org.webrtc.*;
import org.webrtc.YuvConverter;

import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.opengl.GLES20;
import android.opengl.GLUtils;

public class BgBlurProcessor implements VideoProcessor {
    private SurfaceTextureHelper textureHelper;
    private VideoSink mSink;
    private String name;
    private ImageProcessor processor;
    private YuvConverter yuvConverter = new YuvConverter();
    private Matrix transform = new Matrix();
    private int[] textures;
    private TextureBufferImpl buffer;
    private YuvFrame yuvFrame = null;
    private VideoFrame.I420Buffer i420buffer;

    public BgBlurProcessor(SurfaceTextureHelper textureHelper) {
        this.textureHelper = textureHelper;
        this.textures = new int[1];
        this.processor = new ImageProcessor();
    }

    public BgBlurProcessor(String name, SurfaceTextureHelper textureHelper) {
        this.textureHelper = textureHelper;
        this.name = name;
        this.textures = new int[1];
        this.processor = new ImageProcessor();
    }

    public BgBlurProcessor(String name, SurfaceTextureHelper textureHelper, String bgImageUrl) {
        this.textureHelper = textureHelper;
        this.name = name;
        this.processor = new ImageProcessor(bgImageUrl);
        this.textures = new int[1];
    }

    @Override
    public void onCapturerStarted(boolean success) {

    }

    @Override
    public void onCapturerStopped() {

    }

    @Override
    public void setSink(VideoSink sink) {
        mSink = sink;
    }

    @Override
    public void onFrameCaptured(VideoFrame frame) {
        // do all image processing to the
        // frame.retain();
        if (yuvFrame == null) {
            yuvFrame = new YuvFrame(frame, YuvFrame.PROCESSING_NONE,
                    frame.getTimestampNs());
        } else {
            yuvFrame.fromVideoFrame(frame, YuvFrame.PROCESSING_NONE,
                    frame.getTimestampNs());
        }
        Bitmap bit2 = yuvFrame.getBitmap();

        // do bitmap processing here
        bit2 = processor.process(bit2, name);

        if (bit2 == null) {
            mSink.onFrame(frame);
            frame.release();
            return;
        }

        VideoFrame outputFrame = bitmap2videoFrame(bit2, frame);
        // Send VideoFrame back to WebRTC
        mSink.onFrame(outputFrame);
        outputFrame.release();
        frame.release();
        if (bit2 != null) {
            bit2.recycle();
        }
        bit2 = null;
    }

    private VideoFrame bitmap2videoFrame(Bitmap bitmap, VideoFrame frame) {
        if (bitmap == null)
            return new VideoFrame(frame.getBuffer().toI420(), 0, frame.getTimestampNs());
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        textures = new int[1];
        // long start = System.nanoTime();
        GLES20.glGenTextures(0, textures, 1);

        // TextureBuffer 생성
        buffer = new TextureBufferImpl(width, height,
                VideoFrame.TextureBuffer.Type.RGB,
                textures[0],
                transform,
                textureHelper.getHandler(),
                yuvConverter,
                null);

        // 텍스처에 특정 Bitmap bitmap 이미지 로드
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER,
                GLES20.GL_NEAREST);

        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER,
                GLES20.GL_NEAREST);

        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0);

        // 텍스처버퍼를 i420 버퍼로 변경
        i420buffer = yuvConverter.convert(buffer);

        // long timestamp = System.nanoTime() - start;
        // 비디오 프레임 생성
        VideoFrame videoFrame = new VideoFrame(i420buffer, 180, frame.getTimestampNs());
        if (bitmap != null) {
            bitmap.recycle();
        }
        bitmap = null;
        // buffer.release();
        // buffer = null;
        return videoFrame;
    }

}
