// 병원 안전관리 모바일 앱 (Epic 6, Story 6.1)
// 역할: 이미 배포된 웹 화면(Vercel)을 앱 안의 WebView로 띄워, 휴대폰에서 '앱처럼' 쓰게 한다.
// - 웹 주소만 감싸므로, 웹을 업데이트하면 앱도 자동으로 최신 화면이 된다(따로 앱 재배포 불필요).
// - 뒤로가기 버튼: 웹 안에서 이전 화면이 있으면 그쪽으로, 없으면 앱 종료.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

// 배포된 웹 화면 주소(Vercel). 주소가 바뀌면 여기만 고치면 된다.
const String kWebUrl = 'https://hospital-app-xi-ruby.vercel.app';

// 웹에게 "이건 모바일 앱(WebView)에서 열린 화면"이라고 알려주는 표식.
// 웹은 이 표식이 있으면 보안 정책(앱 종료/미사용 시 재로그인)을 켠다.
// PC 브라우저는 이 표식 없이 접속하므로 기존처럼 로그인이 유지된다.
const String kAppUrl = '$kWebUrl/?client=app';

void main() {
  runApp(const HospitalApp());
}

class HospitalApp extends StatelessWidget {
  const HospitalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: '병원 안전관리',
      debugShowCheckedModeBanner: false,
      home: WebViewPage(),
    );
  }
}

class WebViewPage extends StatefulWidget {
  const WebViewPage({super.key});

  @override
  State<WebViewPage> createState() => _WebViewPageState();
}

class _WebViewPageState extends State<WebViewPage> {
  late final WebViewController _controller;
  bool _loading = true; // 페이지 로딩 중이면 가운데에 스피너 표시

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted) // 웹앱이 JS로 동작하므로 허용
      ..setBackgroundColor(const Color(0xFF0A0A0A)) // 다크 테마 배경(흰 깜빡임 방지)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
        ),
      )
      ..loadRequest(Uri.parse(kAppUrl)); // 모바일 표식(?client=app)을 붙여 첫 화면을 연다.
  }

  @override
  Widget build(BuildContext context) {
    // 안드로이드 뒤로가기: 웹에 이전 화면이 있으면 뒤로, 없으면 앱 종료.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          await SystemNavigator.pop(); // 더 갈 데 없으면 앱 종료
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0A0A0A),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_loading)
                const Center(child: CircularProgressIndicator()),
            ],
          ),
        ),
      ),
    );
  }
}
