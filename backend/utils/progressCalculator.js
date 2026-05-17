const calculateProgress = (goals, sharedGoals = []) => {
  const allGoals = [...(goals || []), ...(sharedGoals || [])]
  if (!Array.isArray(allGoals) || allGoals.length === 0) return 0

  const total = allGoals.reduce((sum, goal) => sum + (goal.achievement || 0), 0)
  const max = allGoals.reduce((sum, goal) => sum + (goal.target || 0), 0)

  if (max === 0) return 0
  return Math.min(100, Math.round((total / max) * 100))
}

module.exports = calculateProgress
