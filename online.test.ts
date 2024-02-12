import { assert, assertEquals } from "std/assert";
import { DAVClient } from "tsdav";
// @deno-types="@types/dav"
import * as dav from "dav";

async function getSecrets(): Promise<{ password: string; serverUrl: string }> {
  const secrets = await Deno.readTextFile("./test_space/SECRETS.md");
  // HACK: Assumes password to just be written after the key with no quotes etc.
  const passwordRegex = /carddavPassword:\s*([^\r\n]*)\r?\n/;
  const password = secrets.match(passwordRegex)![1];
  const urlRegex = /serverUrl:\s*([^\r\n]*)\r?\n/;
  const serverUrl = secrets.match(urlRegex)![1];
  return { password: password, serverUrl: serverUrl };
}

Deno.test("dav auth test", async () => {
  const secrets = await getSecrets();

  const xhr = new dav.transport.Basic(
    new dav.Credentials({ username: "exemplar", password: secrets.password }),
  );

  const account = await dav.createAccount({
    server: secrets.serverUrl,
    accountType: "carddav",
    xhr: xhr,
  } as dav.CreateAccountOptions);

  console.log(account);
});

Deno.test("tsdav auth test", { ignore: true }, async () => {
  const secrets = await getSecrets();

  const client = new DAVClient({
    serverUrl: secrets.serverUrl,
    credentials: {
      username: "exemplar",
      password: secrets.password,
    },
    authMethod: "Basic",
    defaultAccountType: "carddav",
  });

  // FIXME: Fails with the following:
  // error: TypeError: Cannot read properties of undefined (reading 'write')
  //     at HttpsClientRequest._writeRaw (ext:deno_node/_http_outgoing.ts:422:24)
  await client.login();
});
