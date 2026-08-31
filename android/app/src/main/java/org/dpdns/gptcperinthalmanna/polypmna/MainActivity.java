package org.dpdns.gptcperinthalmanna.polypmna;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://gptcperinthalmanna.dpdns.org";
    private WebView webView;
    private ProgressBar progress;
    private LinearLayout errorPanel;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(248, 250, 252));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(248, 250, 252));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(13, 148, 136)));

        errorPanel = buildErrorPanel();
        errorPanel.setVisibility(View.GONE);

        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(-1, dp(3));
        progressParams.gravity = Gravity.TOP;
        root.addView(progress, progressParams);
        root.addView(errorPanel, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value);
                progress.setVisibility(value == 100 ? View.GONE : View.VISIBLE);
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && "gptcperinthalmanna.dpdns.org".equals(uri.getHost())) return false;
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }

            @Override public void onPageFinished(WebView view, String url) {
                errorPanel.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame()) {
                    webView.setVisibility(View.GONE);
                    errorPanel.setVisibility(View.VISIBLE);
                }
            }
        });

        if (state != null) webView.restoreState(state);
        else webView.loadUrl(resolveLaunchUrl(getIntent()));
    }

    private String resolveLaunchUrl(Intent intent) {
        Uri data = intent.getData();
        return data != null && "gptcperinthalmanna.dpdns.org".equals(data.getHost()) ? data.toString() : ORIGIN + "/";
    }

    private LinearLayout buildErrorPanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER);
        panel.setPadding(dp(32), dp(32), dp(32), dp(32));
        panel.setBackgroundColor(Color.rgb(248, 250, 252));

        TextView mark = new TextView(this);
        mark.setText("POLY");
        mark.setTextSize(28);
        mark.setTextColor(Color.rgb(13, 148, 136));
        mark.setGravity(Gravity.CENTER);

        TextView title = new TextView(this);
        title.setText("You’re offline");
        title.setTextSize(22);
        title.setTextColor(Color.rgb(15, 23, 42));
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, dp(18), 0, dp(8));

        TextView detail = new TextView(this);
        detail.setText("Reconnect to open your curriculum, notes, mock exams, and POLY AI.");
        detail.setTextSize(15);
        detail.setTextColor(Color.rgb(71, 85, 105));
        detail.setGravity(Gravity.CENTER);

        Button retry = new Button(this);
        retry.setText("Try again");
        retry.setTextColor(Color.WHITE);
        retry.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(13, 148, 136)));
        retry.setOnClickListener(view -> {
            errorPanel.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.reload();
        });

        panel.addView(mark);
        panel.addView(title);
        panel.addView(detail, new LinearLayout.LayoutParams(-1, -2));
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(dp(180), dp(52));
        retryParams.topMargin = dp(24);
        panel.addView(retry, retryParams);
        return panel;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        webView.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
