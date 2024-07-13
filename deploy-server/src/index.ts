import { createClient, commandOptions } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
    
  // infinitely running loop that pulls id from the redis queue
  while (1) {
    const res = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    const id = res?.element || "";
    console.log(id);
    await downloadS3Folder(`output/${id}`);
    await buildProject(id).then(() => copyFinalDist(id));

    publisher.hSet("status", id, "deployed");

  }
}

main();
