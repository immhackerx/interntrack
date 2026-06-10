export function calculateMatchScore(userSkills: string[], role: string, tags: string[]): number {
  if (!userSkills || userSkills.length === 0) return 0;

  let matchPoints = 0;
  const totalPossible = userSkills.length;

  const targetText = `${role.toLowerCase()} ${tags.join(' ').toLowerCase()}`;

  for (const skill of userSkills) {
    const skillRegex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (skillRegex.test(targetText)) {
      matchPoints++;
    }
  }

  return Math.round((matchPoints / totalPossible) * 100);
}
