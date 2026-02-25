import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'no_connection_screen.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasConnection = true;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;

  static const String _websiteUrl = 'https://financeiro.giovannidev.com/';
  static const String _websiteDomain = 'financeiro.giovannidev.com';

  @override
  void initState() {
    super.initState();
    _initWebView();
    _listenToConnectivity();
  }

  // Verifica se a URL é externa ao domínio do site
  bool _isExternalUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.host.isNotEmpty && uri.host != _websiteDomain;
    } catch (e) {
      return false;
    }
  }

  // Abre URL no navegador externo
  Future<void> _launchExternalUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (kDebugMode) {
          print('URL externa aberta: $url');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Erro ao abrir URL externa: $e');
      }
    }
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..enableZoom(false)
      ..setBackgroundColor(const Color(0xFF121212))
      ..setUserAgent('Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36')
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;
            
            // Verifica se é URL externa
            if (_isExternalUrl(url)) {
              if (kDebugMode) {
                print('URL externa detectada: $url');
              }
              _launchExternalUrl(url);
              return NavigationDecision.prevent;
            }
            
            // Permite navegação interna
            return NavigationDecision.navigate;
          },
          onPageStarted: (String url) {
            if (kDebugMode) {
              print('Página iniciada: $url');
            }
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            if (kDebugMode) {
              print('Página carregada: $url');
            }
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            if (kDebugMode) {
              print('WebView Error: ${error.errorType} - ${error.description}');
            }
            
            if (error.isForMainFrame == true) {
              if (error.errorType == WebResourceErrorType.hostLookup ||
                  error.errorType == WebResourceErrorType.connect ||
                  error.errorType == WebResourceErrorType.timeout) {
                setState(() {
                  _hasConnection = false;
                  _isLoading = false;
                });
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_websiteUrl));
  }

  void _listenToConnectivity() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen(
      (List<ConnectivityResult> results) {
        final hasConnection = !results.contains(ConnectivityResult.none);
        
        if (hasConnection && !_hasConnection) {
          if (kDebugMode) {
            print('Conexão restaurada, recarregando...');
          }
          setState(() {
            _hasConnection = true;
            _isLoading = true;
          });
          Future.delayed(const Duration(milliseconds: 100), () {
            _controller.reload();
          });
        }
      },
    );
  }

  Future<void> _onRetry() async {
    if (kDebugMode) {
      print('Tentando reconectar...');
    }
    setState(() {
      _hasConnection = true;
      _isLoading = true;
    });
    _controller.reload();
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_hasConnection) {
      return NoConnectionScreen(onRetry: _onRetry);
    }

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              Container(
                color: const Color(0xFF121212),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        color: Color.fromARGB(255, 140, 80, 236),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Carregando Organiza Aí...',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
