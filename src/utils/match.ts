export const calculateMatchScore = (
    resumeText: string,
    jobText: string
): { score: number; summary: string } => {
    const resumeWords = resumeText.toLowerCase().split(/\W+/);
    const jobWords = jobText.toLowerCase().split(/\W+/);

    const common = resumeWords.filter(word => jobWords.includes(word));
    const score = Math.min(
        100,
        Math.round((common.length / jobWords.length) * 100)
    );

    return {
        score,
        summary: `Matched ${common.length} relevant keywords`
    };
};