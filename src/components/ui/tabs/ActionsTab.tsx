'use client';

import { useCallback, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { ShareButton } from '../Share';
import { Button } from '../Button';
import { SignIn } from '../wallet/SignIn';
import { type Haptics } from '@farcaster/miniapp-sdk';
import { APP_URL } from '~/lib/constants';

/**
 * ActionsTab component handles mini app actions like sharing, notifications, and haptic feedback.
 *
 * This component provides the main interaction interface for users to:
 * - Share the mini app with others
 * - Sign in with Farcaster
 * - Send notifications to their account
 * - Trigger haptic feedback
 * - Add the mini app to their client
 * - Copy share URLs
 *
 * The component uses the useMiniApp hook to access Farcaster context and actions.
 * All state is managed locally within this component.
 *
 * @example
 * ```tsx
 * <ActionsTab />
 * ```
 */
export function ActionsTab() {
  // --- Hooks ---
  const { actions, added, notificationDetails, haptics, context } =
    useMiniApp();

  // --- State ---
  const [notificationState, setNotificationState] = useState({
    sendStatus: '',
    shareUrlCopied: false,
  });
  const [selectedHapticIntensity, setSelectedHapticIntensity] =
    useState<Haptics.ImpactOccurredType>('medium');

  // --- Handlers ---
  /**
   * Sends a notification to the current user's Farcaster account.
   *
   * This function makes a POST request to the /api/send-notification endpoint
   * with the user's FID and notification details. It handles different response
   * statuses including success (200), rate limiting (429), and errors.
   *
   * @returns Promise that resolves when the notification is sent or fails
   */
  const sendFarcasterNotification = useCallback(async () => {
    setNotificationState((prev) => ({ ...prev, sendStatus: '' }));
    if (!notificationDetails || !context) {
      return;
    }
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        mode: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });
      if (response.status === 200) {
        setNotificationState((prev) => ({ ...prev, sendStatus: 'Success' }));
        return;
      } else if (response.status === 429) {
        setNotificationState((prev) => ({
          ...prev,
          sendStatus: 'Rate limited',
        }));
        return;
      }
      const responseText = await response.text();
      setNotificationState((prev) => ({
        ...prev,
        sendStatus: `Error: ${responseText}`,
      }));
    } catch (error) {
      setNotificationState((prev) => ({
        ...prev,
        sendStatus: `Error: ${error}`,
      }));
    }
  }, [context, notificationDetails]);

  /**
   * Copies the share URL for the current user to the clipboard.
   *
   * This function generates a share URL using the user's FID and copies it
   * to the clipboard. It shows a temporary "Copied!" message for 2 seconds.
   */
  const copyUserShareUrl = useCallback(async () => {
    if (context?.user?.fid) {
      const userShareUrl = `${APP_URL}/share/${context.user.fid}`;
      await navigator.clipboard.writeText(userShareUrl);
      setNotificationState((prev) => ({ ...prev, shareUrlCopied: true }));
      setTimeout(
        () =>
          setNotificationState((prev) => ({ ...prev, shareUrlCopied: false })),
        2000
      );
    }
  }, [context?.user?.fid]);

  /**
   * Triggers haptic feedback with the selected intensity.
   *
   * This function calls the haptics.impactOccurred method with the current
   * selectedHapticIntensity setting. It handles errors gracefully by logging them.
   */
  const triggerHapticFeedback = useCallback(async () => {
    try {
      await haptics.impactOccurred(selectedHapticIntensity);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, [haptics, selectedHapticIntensity]);

  // --- Render ---
  return (
    <div className="space-y-3 w-full mx-auto">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center mb-1">
          <span className="text-2xl mr-1">⚡</span>
          <div className="w-6 h-6">
            <img 
              src="/pudgy-image.jpg" 
              alt="Pudgy Pet" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        <h2 className="text-lg font-trailers text-pudgy-oxford mb-1">Pudgy Actions</h2>
                <p className="text-xs text-pudgy-oxford/70 font-fobble bg-gradient-to-r from-pudgy-azure/30 to-pudgy-lavender/30 px-2 py-1 rounded-lg">
          Share with friends and explore the Pudgy universe! 🌊
        </p>
      </div>

      {/* Share functionality */}
      <div className="bg-gradient-to-r from-pudgy-floral to-pudgy-azure rounded-2xl p-4 border border-pudgy-sky/30 shadow-lg">
        <ShareButton
          buttonText="🚀 Share Pudgy Pet"
          cast={{
            text: 'Just got my own Pudgy Pet! 🐧✨ This AI companion is amazing! Come get yours! 🪐',
            bestFriends: true,
            embeds: [`${APP_URL}/share/${context?.user?.fid || ''}`],
          }}
          className="w-full !bg-gradient-to-r !from-pudgy-blue !to-pudgy-sky hover:!from-pudgy-sky hover:!to-pudgy-blue !font-kvant !py-3 !rounded-xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 !transform hover:!scale-105"
        />
      </div>

      {/* Authentication */}
      <div className="bg-gradient-to-r from-pudgy-lavender to-pudgy-floral rounded-2xl p-4 border border-pudgy-plum/20 shadow-lg">
        <SignIn />
      </div>

      {/* Mini app actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() =>
            actions.openUrl('https://pudgypenguins.com')
          }
          className="!bg-gradient-to-r !from-pudgy-mint !to-green-400 hover:!from-green-400 hover:!to-pudgy-mint !text-white !font-bold !py-4 !rounded-2xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 !transform hover:!scale-105 !max-w-none"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🌐</span>
            <span className="text-xs font-kvant">Visit Site</span>
          </div>
        </Button>

        <Button 
          onClick={actions.addMiniApp} 
          disabled={added} 
          className="!bg-gradient-to-r !from-pudgy-jasmine !to-yellow-400 hover:!from-yellow-400 hover:!to-pudgy-jasmine !text-white !font-bold !py-4 !rounded-2xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 !transform hover:!scale-105 disabled:!opacity-50 disabled:!hover:scale-100 !max-w-none"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">{added ? '✅' : '📱'}</span>
            <span className="text-xs font-kvant">{added ? 'Added!' : 'Add App'}</span>
          </div>
        </Button>
      </div>

      {/* Notification functionality */}
      <div className="bg-gradient-to-r from-pudgy-coral/20 to-pudgy-plum/20 rounded-2xl p-4 border border-pudgy-coral/30 shadow-lg">
        {notificationState.sendStatus && (
          <div className="text-sm text-center mb-3 p-2 bg-white/70 rounded-xl font-medium text-pudgy-oxford">
            📢 {notificationState.sendStatus}
          </div>
        )}
        <Button
          onClick={sendFarcasterNotification}
          disabled={!notificationDetails}
          className="w-full !bg-gradient-to-r !from-pudgy-coral !to-pudgy-plum hover:!from-pudgy-plum hover:!to-pudgy-coral !text-white !font-bold !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !transform hover:!scale-105 disabled:!opacity-50 disabled:!hover:scale-100 !max-w-none"
        >
          🔔 Send Notification
        </Button>
      </div>

      {/* Share URL copying */}
      <Button
        onClick={copyUserShareUrl}
        disabled={!context?.user?.fid}
        className="w-full !bg-gradient-to-r !from-pudgy-sky !to-pudgy-blue hover:!from-pudgy-blue hover:!to-pudgy-sky !text-white !font-bold !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !transform hover:!scale-105 disabled:!opacity-50 disabled:!hover:scale-100 !max-w-none"
      >
        {notificationState.shareUrlCopied ? '✅ Copied!' : '🔗 Copy Share URL'}
      </Button>

      {/* Haptic feedback controls */}
      <div className="bg-gradient-to-r from-pudgy-azure to-pudgy-blizzard rounded-2xl p-4 border border-pudgy-sky/30 shadow-lg">
                <label className="block text-sm font-kvant text-pudgy-oxford mb-3 text-center">
          Select haptic intensity:
        </label>
        <select
          value={selectedHapticIntensity}
          onChange={(e) =>
            setSelectedHapticIntensity(
              e.target.value as Haptics.ImpactOccurredType
            )
          }
          className="w-full px-4 py-3 mb-3 border border-pudgy-sky/30 rounded-xl bg-white text-pudgy-oxford font-medium focus:outline-none focus:ring-2 focus:ring-pudgy-blue shadow-inner"
        >
          <option value={'light'}>🪶 Light</option>
          <option value={'medium'}>🥊 Medium</option>
          <option value={'heavy'}>💥 Heavy</option>
          <option value={'soft'}>🌸 Soft</option>
          <option value={'rigid'}>🔧 Rigid</option>
        </select>
        <Button 
          onClick={triggerHapticFeedback} 
          className="w-full !bg-gradient-to-r !from-pudgy-oxford !to-gray-700 hover:!from-gray-700 hover:!to-pudgy-oxford !text-white !font-bold !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !transform hover:!scale-105 !max-w-none"
        >
          ⚡ Feel the Buzz
        </Button>
      </div>
    </div>
  );
}
