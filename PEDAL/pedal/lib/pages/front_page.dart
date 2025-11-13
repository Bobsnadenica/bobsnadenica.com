

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/app_state.dart';

class FrontPage extends StatefulWidget {
  const FrontPage({super.key});
  @override
  State<FrontPage> createState() => _FrontPageState();
}

class _FrontPageState extends State<FrontPage> {
  final TextEditingController _search = TextEditingController();
  final List<String> _mockThumbs = List.generate(16, (i) => 'item_$i');

  @override
  Widget build(BuildContext context) {
    final loggedIn = AppStateProvider.of(context).loggedIn;

    return Scaffold(
      backgroundColor: const Color(0xFF070b14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0b1220),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('П.Е.Д.А.Л.ш', style: GoogleFonts.inter(fontWeight: FontWeight.w800)),
            Text('Публичен електронен дневник',
                style: TextStyle(
                    color: Colors.white.withOpacity(.6), fontSize: 12)),
          ],
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Center(
              child: Text(
                'Паркирай тук, стани част от П.Е.Д.А.Л.',
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withOpacity(.8)),
              ),
            ),
            const SizedBox(height: 10),
            // Buttons row (Random + Coming Soon)
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              runSpacing: 10,
              children: [
                _chipButton('🎲 Случайна снимка', onTap: () {
                  // TODO: open random viewer (later via S3)
                }),
                _chipButton('🤖 Android (Скоро)', disabled: true),
                _chipButton('🍎 iOS (Скоро)', disabled: true),
                if (loggedIn) _chipButton('⬆️ Качване (Скоро)', disabled: true),
                if (loggedIn) _chipButton('📁 Моите доклади (Скоро)', disabled: true),
              ],
            ),
            const SizedBox(height: 14),
            // Search
            TextField(
              controller: _search,
              decoration: InputDecoration(
                hintText: 'Търси по регион (CB, E) или номер (7072TH)…',
                filled: true,
                fillColor: const Color(0xFF0b1220),
                prefixIcon: const Padding(
                  padding: EdgeInsets.only(left: 10, right: 6),
                  child: Text('🔍', style: TextStyle(fontSize: 18)),
                ),
                prefixIconConstraints: const BoxConstraints(minWidth: 36),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFFef4444)),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 8),
            Text(
              'Разгледай по регион → номер. Докосни за доказателства.',
              style: TextStyle(color: Colors.white.withOpacity(.5), fontSize: 12),
            ),
            const SizedBox(height: 16),
            // Grid (placeholder for now)
            LayoutBuilder(
              builder: (context, c) {
                final cross = MediaQuery.of(context).size.width > 1200
                    ? 5
                    : MediaQuery.of(context).size.width > 900
                        ? 4
                        : MediaQuery.of(context).size.width > 600
                            ? 3
                            : 2;
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _mockThumbs.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: cross,
                    childAspectRatio: 4 / 5,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemBuilder: (context, i) => _thumbCard(context, i),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _chipButton(String label, {VoidCallback? onTap, bool disabled = false}) {
    final bg = disabled ? const Color(0xFF0f172a) : const Color(0xFF111827);
    final br = disabled ? const Color(0xFF334155) : const Color(0xFF475569);
    return Opacity(
      opacity: disabled ? .7 : 1,
      child: Material(
        color: bg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: br),
        ),
        child: InkWell(
          onTap: disabled ? null : onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Text(label,
                style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ),
      ),
    );
  }

  Widget _thumbCard(BuildContext context, int i) {
    // Placeholder evidence card (matches site vibe)
    return Material(
      color: const Color(0xFF0f172a),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF1f2937)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          // TODO: open image/video viewer
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Media placeholder
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16)),
                  gradient: const LinearGradient(
                    colors: [Color(0xFFef4444), Color(0xFFf59e0b)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Center(
                  child: Text('Доказателство', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800)),
                ),
              ),
            ),
            // Date line (under thumbnail)
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 4),
              child: Text('📅 неизвестна дата',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.white.withOpacity(.6), fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}