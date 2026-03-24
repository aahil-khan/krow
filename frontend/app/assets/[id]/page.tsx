export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Asset Detail</h1>
      <p className="text-muted-foreground">Asset {params.id} details will appear here.</p>
    </div>
  );
}
