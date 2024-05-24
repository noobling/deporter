import OpenGraph from "open-graph";

export interface OpenGraphData extends OpenGraph.Data {
  link: string;
}

export async function og(link: string) {
  if (!link) return null;

  const promise = new Promise<OpenGraphData | null>((resolve, reject) => {
    OpenGraph(link, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const result = { ...data, link: link } as OpenGraphData;
        resolve(result ?? null);
      }
    });
  });

  return promise;
}
