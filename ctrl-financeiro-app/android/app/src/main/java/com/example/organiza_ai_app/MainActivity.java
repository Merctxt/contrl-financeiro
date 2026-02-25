package com.example.organiza_ai_app;

import android.os.Bundle;
import android.webkit.WebView;
import io.flutter.embedding.android.FlutterActivity;

public class MainActivity extends FlutterActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Habilita debugging do WebView
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
