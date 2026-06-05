import SurveyForm from "./SurveyForm"

export default async function SurveyPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  return <SurveyForm clientId={clientId} />
}

export const metadata = {
  title: "Exit Survey: Skills for Change",
  description: "Share your experience with Skills for Change",
}
