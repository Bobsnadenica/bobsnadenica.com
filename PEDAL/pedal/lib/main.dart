import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'pages/login_page.dart';
import 'pages/front_page.dart';
import 'services/app_state.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const PedalApp());
}


class PedalApp extends StatefulWidget {
  const PedalApp({super.key});
  @override
  State<PedalApp> createState() => _PedalAppState();
}

class _PedalAppState extends State<PedalApp> {
  final appState = AppState();

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: appState,
      child: MaterialApp(
        title: 'П.Е.Д.А.Л.ш',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme(),
        initialRoute: '/login',
        routes: {
          '/login': (_) => const LoginPage(),
          '/front': (_) => const FrontPage(),
        },
      ),
    );
  }
}