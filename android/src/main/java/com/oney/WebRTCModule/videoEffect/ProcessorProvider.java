package com.oney.WebRTCModule.videoEffect;

import java.util.HashMap;
import java.util.Map;

public class ProcessorProvider {
    private static Map<String, VideoFrameProcessorFactoryInterface> methodMap = new HashMap<String, VideoFrameProcessorFactoryInterface>();

    public static VideoFrameProcessor getProcessor(String name) {
        if (methodMap.containsKey(name)) {
            return methodMap.get(name).build();
        } else
            return null;
    }

    public static void addProcessor(String name,
            VideoFrameProcessorFactoryInterface videoFrameProcessorFactoryInterface) {
        if (name != null && videoFrameProcessorFactoryInterface != null) {
            methodMap.put(name, videoFrameProcessorFactoryInterface);
        }
    }

    public static void removeProcessor(String name) {
        methodMap.remove(name);
    }
}
