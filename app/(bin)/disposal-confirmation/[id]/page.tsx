import { getDisposalsByQueue } from "@/app/action/disposal";
import Card from "@/components/Card/Card";
import DisposalConfirmationCard from "@/components/Card/DisposalConfirmationCard";
import BinDisposalChart from "@/components/Chart/BinDisposalChart";
import { notFound } from "next/navigation";

const DisposalConfirmationPage = async ({
  params,
}: {
  params: { id: string; queueId: string };
}) => {
  const disposals = await getDisposalsByQueue(params.queueId);
  if ("error" in disposals || !Array.isArray(disposals)) {
    notFound();
  }

  return (
    <Card rounded>
      <DisposalConfirmationCard id={params.id} />
      <BinDisposalChart disposals={disposals} />
    </Card>
  );
};

export default DisposalConfirmationPage;
