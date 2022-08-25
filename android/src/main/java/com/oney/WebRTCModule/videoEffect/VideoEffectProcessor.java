package com.oney.WebRTCModule.videoEffect;

import org.webrtc.*;

public class VideoEffectProcessor implements VideoProcessor {
    private VideoSink mSink;
    final private SurfaceTextureHelper textureHelper;
    final private VideoFrameProcessor videoFrameProcessor;

    public VideoEffectProcessor(VideoFrameProcessor processor, SurfaceTextureHelper textureHelper) {
        this.textureHelper = textureHelper;
        this.videoFrameProcessor = processor;
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
        VideoFrame outputFrame = videoFrameProcessor.process(frame, textureHelper);

        if (outputFrame == null) {
            mSink.onFrame(frame);
            return;
        }
        mSink.onFrame(outputFrame);
        frame.release();
    }

}
