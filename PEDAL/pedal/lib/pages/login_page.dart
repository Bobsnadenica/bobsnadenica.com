

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/app_state.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final app = AppStateProvider.of(context);
    return Scaffold(
      backgroundColor: const Color(0xFF070b14),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App icon vibe
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(18)),
                      gradient: LinearGradient(
                        colors: [Color(0xFFef4444), Color(0xFFf59e0b)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: const Text('П',
                        style: TextStyle(
                            fontWeight: FontWeight.w800,
                            color: Colors.black,
                            fontSize: 22)),
                  ),
                  const SizedBox(height: 12),
                  Text('П.Е.Д.А.Л.ш',
                      style: GoogleFonts.inter(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                      )),
                  const SizedBox(height: 6),
                  Text(
                    'Паркирай тук, стани част от П.Е.Д.А.Л.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white.withOpacity(.7), fontSize: 14),
                  ),
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _pillButton(
                        label: 'Вход',
                        emoji: '🔐',
                        onTap: () {
                          app.login(); // mark logged in
                          Navigator.pushReplacementNamed(context, '/front');
                        },
                      ),
                      const SizedBox(width: 12),
                      _pillButton(
                        label: 'Пропусни',
                        emoji: '➡️',
                        onTap: () => Navigator.pushReplacementNamed(context, '/front'),
                        subtle: true,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _pillButton({
    required String label,
    required String emoji,
    required VoidCallback onTap,
    bool subtle = false,
  }) {
    return Material(
      color: subtle ? const Color(0xFF0f172a) : const Color(0xFF111827),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: subtle ? const Color(0xFF334155) : const Color(0xFF475569)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          child: Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Text(label,
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}