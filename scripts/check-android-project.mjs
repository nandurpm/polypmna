import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [manifest, activity, workflow, build] = await Promise.all([
  readFile("android/app/src/main/AndroidManifest.xml", "utf8"),
  readFile("android/app/src/main/java/org/dpdns/gptcperinthalmanna/polypmna/MainActivity.java", "utf8"),
  readFile(".github/workflows/android-release.yml", "utf8"),
  readFile("android/app/build.gradle.kts", "utf8"),
]);

assert.match(manifest, /android\.permission\.INTERNET/);
assert.match(manifest, /android:usesCleartextTraffic="false"/);
assert.match(manifest, /android:host="gptcperinthalmanna\.dpdns\.org"/);
assert.match(activity, /https:\/\/gptcperinthalmanna\.dpdns\.org/);
assert.match(activity, /setJavaScriptEnabled\(true\)/);
assert.match(activity, /setDomStorageEnabled\(true\)/);
assert.match(workflow, /apksigner.*verify/);
assert.match(workflow, /secrets\.ANDROID_KEYSTORE_BASE64/);
assert.match(build, /signingConfig = signingConfigs\.findByName\("release"\)/);
assert.doesNotMatch(`${manifest}\n${activity}\n${build}`, /BEGIN (?:RSA )?PRIVATE KEY/);

console.log("Android project configuration passed");
