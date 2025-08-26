import { getDisposals } from "@/app/action/disposal";
import Card from "@/components/Card/Card";
import DisposalConfirmationCard from "@/components/Card/DisposalConfirmationCard";
import BinDisposalChart from "@/components/Chart/BinDisposalChart";
import { notFound } from "next/navigation";

const DisposalConfirmationPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const disposals = await getDisposals();
  if ("error" in disposals) {
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
