import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: userStatsData, error: userStatsError } = useWidgetAPI(widget, "user");
  const { data: collectionsStatsData, error: collectionsStatsError } = useWidgetAPI(widget, "collections");
  const { data: childStatsData, error: childStatsError } = useWidgetAPI(widget, "childCollections");


  if (userStatsError || collectionsStatsError || childStatsError) {
    return <Container service={service} error={userStatsError || collectionsStatsError || childStatsError} />;
  }

  if (!userStatsData || !childStatsData || !collectionsStatsData) {
    return (
      <Container service={service}>
        <Block label="raindropio.rootCollections" />
        <Block label="raindropio.collections" />
        <Block label="raindropio.childCollections" />
        <Block label="raindropio.totalCollections" />
      </Container>
    );
  }

  const groupCount = userStatsData.user.groups.length;
  const collectionsCount = collectionsStatsData.items.length;
  const childCollectionsCount = childStatsData.items.length;
  const totalCollectionCount = collectionsCount + childCollectionsCount;

  return (
    <Container service={service}>
      <Block label="raindropio.rootCollections" value={groupCount} />
      <Block label="raindropio.collections" value={collectionsCount} />
      <Block label="raindropio.childCollections" value={childCollectionsCount} />
      <Block label="raindropio.totalCollections" value={totalCollectionCount} />
    </Container>
  );
}
