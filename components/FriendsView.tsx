'use client';

import { useState, useTransition } from 'react';
import {
  acceptFriendRequest,
  getFriendState,
  removeFriend,
  sendFriendRequest,
  type FriendProfile,
  type FriendState,
} from '@/lib/friends';

type FriendsViewProps = {
  initial: FriendState;
  initialError?: string | null;
};

type Toast = { kind: 'ok' | 'err'; message: string } | null;

export function FriendsView({ initial, initialError }: FriendsViewProps) {
  const [state, setState] = useState<FriendState>(initial);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [toast, setToast] = useState<Toast>(null);
  const [username, setUsername] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function refreshFriendState() {
    const next = await getFriendState();
    if ('error' in next) {
      setError(next.error);
      return;
    }
    setError(null);
    setState(next);
  }

  function flashToast(next: Toast, ttl = 3000) {
    setToast(next);
    if (next) {
      setTimeout(() => {
        setToast((current) => (current === next ? null : current));
      }, ttl);
    }
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = username.trim();
    if (!value) return;
    startTransition(async () => {
      const result = await sendFriendRequest(value);
      if ('error' in result) {
        flashToast({ kind: 'err', message: result.error });
        return;
      }
      flashToast({ kind: 'ok', message: `Request sent to ${value}` });
      setUsername('');
      await refreshFriendState();
    });
  }

  function handleAccept(otherId: string, name: string | null) {
    setBusyId(otherId);
    startTransition(async () => {
      const result = await acceptFriendRequest(otherId);
      setBusyId(null);
      if ('error' in result) {
        flashToast({ kind: 'err', message: result.error });
        return;
      }
      flashToast({ kind: 'ok', message: `You're now friends with ${name ?? 'them'}` });
      await refreshFriendState();
    });
  }

  function handleRemove(otherId: string, name: string | null, verb: 'remove' | 'decline' | 'cancel') {
    const prompt =
      verb === 'remove'
        ? `Remove ${name ?? 'this friend'}?`
        : verb === 'decline'
        ? `Decline request from ${name ?? 'this user'}?`
        : `Cancel request to ${name ?? 'this user'}?`;
    if (typeof window !== 'undefined' && !window.confirm(prompt)) return;
    setBusyId(otherId);
    startTransition(async () => {
      const result = await removeFriend(otherId);
      setBusyId(null);
      if ('error' in result) {
        flashToast({ kind: 'err', message: result.error });
        return;
      }
      const doneMsg =
        verb === 'remove'
          ? `Removed ${name ?? 'friend'}`
          : verb === 'decline'
          ? 'Request declined'
          : 'Request canceled';
      flashToast({ kind: 'ok', message: doneMsg });
      await refreshFriendState();
    });
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Add-friend form */}
      <div className="rounded-3xl bg-surface border border-border shadow-sm p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-faint mb-2">
          Add a friend
        </div>
        <form className="flex items-center gap-2" onSubmit={handleSend}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 rounded-full bg-surface-alt border border-border px-4 py-2.5 font-body text-text placeholder:text-faint outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
          />
          <button
            type="submit"
            disabled={isPending || username.trim().length === 0}
            className="flex-none rounded-full bg-primary px-5 py-2.5 font-body text-sm font-bold text-white shadow-md shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPending ? 'Sending…' : 'Send request'}
          </button>
        </form>
        {toast && (
          <div
            className={[
              'mt-3 text-xs font-body',
              toast.kind === 'ok' ? 'text-primary-dark' : 'text-accent',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}
        {error && !toast && (
          <div className="mt-3 text-xs font-body text-accent" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {state.incoming.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeading label="Incoming requests" count={state.incoming.length} />
          <ul className="flex flex-col gap-2">
            {state.incoming.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3"
              >
                <Avatar profile={p} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-text truncate leading-tight">
                    {p.username ?? 'Anonymous'}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
                    Wants to be friends
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(p.id, p.username)}
                    disabled={busyId === p.id}
                    className="rounded-full bg-primary px-3 py-1.5 font-body text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id, p.username, 'decline')}
                    disabled={busyId === p.id}
                    className="rounded-full bg-surface-alt px-3 py-1.5 font-body text-xs font-bold text-muted hover:text-text hover:bg-border disabled:opacity-50 transition"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accepted friends */}
      <div className="flex flex-col gap-2">
        <SectionHeading label="Your friends" count={state.accepted.length} />
        {state.accepted.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border px-4 py-6 text-center">
            <p className="font-body text-sm text-muted">
              No friends yet. Add one by username above.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.accepted.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3"
              >
                <Avatar profile={p} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-text truncate leading-tight">
                    {p.username ?? 'Anonymous'}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
                    {p.total_checkins} check-in{p.total_checkins === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-display text-xl text-text tabular-nums leading-none tracking-tight">
                      {p.total_points.toLocaleString()}
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
                      pts
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id, p.username, 'remove')}
                    disabled={busyId === p.id}
                    className="rounded-full bg-surface-alt px-3 py-1.5 font-body text-xs font-bold text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Outgoing requests */}
      {state.outgoing.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeading label="Sent requests" count={state.outgoing.length} />
          <ul className="flex flex-col gap-2">
            {state.outgoing.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3"
              >
                <Avatar profile={p} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-text truncate leading-tight">
                    {p.username ?? 'Anonymous'}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
                    Request pending
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(p.id, p.username, 'cancel')}
                  disabled={busyId === p.id}
                  className="rounded-full bg-surface-alt px-3 py-1.5 font-body text-xs font-bold text-muted hover:text-text hover:bg-border disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <h2 className="font-display text-sm uppercase tracking-widest text-muted">
        {label}
      </h2>
      <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-surface-alt text-faint font-body text-[11px] font-bold px-1.5 tabular-nums">
        {count}
      </span>
    </div>
  );
}

function Avatar({ profile }: { profile: FriendProfile }) {
  return (
    <span
      className="flex-none flex items-center justify-center w-11 h-11 rounded-full bg-primary-tint text-xl"
      aria-hidden
    >
      {profile.avatar_emoji ?? '67'}
    </span>
  );
}

export default FriendsView;
