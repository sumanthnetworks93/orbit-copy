import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../hyd/LanguageContext';
import { isStartupVoted, toggleStartupVote } from '../services/profileActivity';
import type { Startup } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { UpvoteMark } from '../ui';

type Props = {
  startup: Startup;
  onOpen?: (startup: Startup) => void;
};

export const StartupRow = memo(function StartupRow({ startup, onOpen }: Props) {
  const { copy } = useLanguage();
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(startup.upvotes);

  useEffect(() => {
    setVotes(startup.upvotes);
    void isStartupVoted(startup.id).then(setVoted);
  }, [startup.id, startup.upvotes]);

  async function handleVote() {
    const next = await toggleStartupVote(startup.id);
    setVoted(next.voted);
    setVotes((count) => count + (next.voted ? 1 : -1));
  }

  const roles = `${startup.openRoles} ${startup.openRoles === 1 ? 'role' : 'roles'}`;

  return (
    <Pressable
      testID={`startup-row-${startup.id}`}
      disabled={!onOpen}
      onPress={() => onOpen?.(startup)}
      style={({ pressed }) => [styles.row, pressed && onOpen ? styles.pressed : null]}
    >
      <View style={[styles.avatar, { backgroundColor: startup.color }]}>
        <Text style={styles.initial}>{startup.initial}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{startup.name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {startup.description}
        </Text>
        <View style={styles.topics}>
          <View style={styles.topic}>
            <Text style={styles.topicText}>{startup.category}</Text>
          </View>
          <View style={styles.topic}>
            <Text style={styles.topicText}>{roles}</Text>
          </View>
          {startup.outsideLocation ? (
            <View style={styles.topic} testID={`startup-outside-${startup.id}`}>
              <Text style={styles.topicText}>{copy.outsideLocation}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <UpvoteMark
        testID={`startup-upvote-${startup.id}`}
        count={votes}
        voted={voted}
        onPress={() => void handleVote()}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.canvas,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  topic: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.sand,
  },
  topicText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  pressed: { opacity: 0.88 },
});
