/**
 * Seed demo users into the FoodGrabber leaderboard.
 *
 * Run:  npx tsx scripts/seed-demo-users.ts
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local.
 * Creates auth users via the admin API (FK on profiles.id requires real auth.users rows),
 * then updates each profile row (auto-created by the on_auth_user_created trigger) with
 * a funny Singaporean username, emoji avatar, and believable points/check-ins.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) throw new Error('missing supabase env vars');

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

type Demo = { username: string; emoji: string; points: number; checkins: number };

const DEMO_USERS: Demo[] = [
  { username: 'AhBengRacer67',      emoji: '🏎️', points: 4850, checkins: 37 },
  { username: 'KiasuKing',          emoji: '👑', points: 4200, checkins: 34 },
  { username: 'UncleRogerLah',      emoji: '🍜', points: 3950, checkins: 31 },
  { username: 'LimPehGotTime',      emoji: '🧔', points: 3500, checkins: 28 },
  { username: 'ChopeSpecialist',    emoji: '🎟️', points: 3150, checkins: 26 },
  { username: 'ShiokSenpai',        emoji: '😎', points: 2900, checkins: 24 },
  { username: 'WahLauEh',           emoji: '🙊', points: 2650, checkins: 22 },
  { username: 'DurianDoge',         emoji: '🥇', points: 2400, checkins: 20 },
  { username: 'KopiGauDai',         emoji: '☕', points: 2100, checkins: 19 },
  { username: 'MakanMachine',       emoji: '🍲', points: 1950, checkins: 17 },
  { username: 'BotakBossku',        emoji: '🧑‍🦲', points: 1700, checkins: 15 },
  { username: 'LalangPrincess',     emoji: '👸', points: 1450, checkins: 13 },
  { username: 'CanOrNotBro',        emoji: '🤔', points: 1200, checkins: 11 },
  { username: 'SiaoOnz',            emoji: '🤪', points: 1000, checkins: 10 },
  { username: 'MrTMakcikMakan',     emoji: '🥮', points: 850,  checkins: 8  },
  { username: 'SingaPawerUp',       emoji: '🦁', points: 700,  checkins: 7  },
  { username: 'LanSiApek',          emoji: '🕶️', points: 550,  checkins: 6  },
  { username: 'KFCMidnight',        emoji: '🍗', points: 400,  checkins: 5  },
  { username: 'BukitTimahTurbo',    emoji: '🏃', points: 250,  checkins: 3  },
  { username: 'CharsiewPrayer',     emoji: '🙏', points: 100,  checkins: 2  },
];

async function main() {
  console.log(`seeding ${DEMO_USERS.length} demo users…`);
  let created = 0, updated = 0, skipped = 0;

  for (const u of DEMO_USERS) {
    const email = `${u.username.toLowerCase()}@foodgrabber.demo`;

    // Create auth user (idempotent — skip if already exists)
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { username: u.username, demo: true },
      password: crypto.randomUUID(),
    });

    let userId: string;
    if (authErr) {
      if (/already\s+registered|already\s+been\s+registered/i.test(authErr.message)) {
        // Look up existing user
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existing = list?.users.find((x) => x.email === email);
        if (!existing) { console.warn(`skip ${u.username}: exists but not found`); skipped++; continue; }
        userId = existing.id;
      } else {
        console.warn(`skip ${u.username}: ${authErr.message}`); skipped++; continue;
      }
    } else {
      userId = authData.user!.id;
      created++;
    }

    // Update the auto-created profile row with demo display data
    const { error: updErr } = await admin
      .from('profiles')
      .update({
        username: u.username,
        avatar_emoji: u.emoji,
        total_points: u.points,
        total_checkins: u.checkins,
      })
      .eq('id', userId);

    if (updErr) { console.warn(`profile update failed for ${u.username}: ${updErr.message}`); continue; }
    updated++;
  }

  console.log(`done: created=${created} updated=${updated} skipped=${skipped}`);

  // Verify by reading the leaderboard view
  const { data: top, error: topErr } = await admin
    .from('leaderboard_v')
    .select('username, avatar_emoji, total_points, total_checkins')
    .limit(5);
  if (topErr) { console.error('verify failed:', topErr.message); return; }
  console.log('\ntop 5:');
  for (const row of top ?? []) {
    console.log(`  ${row.avatar_emoji} ${row.username} — ${row.total_points} pts (${row.total_checkins} check-ins)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
