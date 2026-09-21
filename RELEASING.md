Releasing Domain Resetter

This document describes the release process for Domain Resetter.

Versioning

The project uses package.json as the single source of truth for the extension version.

The version is automatically injected into the generated dist/manifest.json during the build.

Developers should never manually change the version in src/manifest.json.

Release types

Use the appropriate npm script depending on the type of release:

npm run release:patch
npm run release:minor
npm run release:major


These commands:

Update the version in package.json.

Update package-lock.json.

Create a Git commit for the version change.

Create the corresponding Git tag.

Build and package the extension.

Run extension validation before packaging.

For example, for a minor release:

npm run release:minor


If the current version is:

1.2.0


the command will create:

1.3.0


and the corresponding Git tag:

v1.3.0

Publishing the release

After the release command completes successfully, push the commit and tag:

git push origin main --follow-tags


The complete minor-release workflow is therefore:

npm run release:minor
git push origin main --follow-tags


For a patch release:

npm run release:patch
git push origin main --follow-tags


For a major release:

npm run release:major
git push origin main --follow-tags

What happens during a release

The release process follows this flow:

package.json
    │
    │ npm version minor
    ▼
1.2.0 → 1.3.0
    │
    ├── package.json updated
    ├── package-lock.json updated
    ├── Git commit created
    └── Git tag v1.3.0 created
             │
             │ npm run package
             ▼
       scripts/build.mjs
             │
             ├── clean dist/
             ├── copy src/
             └── inject package.json version
                    into dist/manifest.json
                         │
                         ▼
                   web-ext lint
                         │
                         ▼
                  web-ext build
                         │
                         ▼
              web-ext-artifacts/
                         │
                         ▼
              domain_resetter-1.3.0.zip

Important: do not manually edit versions

Do not manually change the version in:

src/manifest.json


Do not manually create Git tags for normal releases.

Do not run npm version separately before running a release:* script.

Use:

npm run release:minor


instead of:

npm version minor
npm run package
npm run release:minor


The latter would increment the version twice.

Before releasing

Make sure your working tree is clean:

git status


You should have no unintended uncommitted changes.

Then run the appropriate release command:

npm run release:minor


Verify the generated artifact in:

web-ext-artifacts/


If everything looks correct, push the release:

git push origin main --follow-tags

Release checklist

 Working tree is clean.

 Changes are committed.

 Correct release type selected.

 npm run release:patch, release:minor, or release:major completes successfully.

 Generated extension artifact has the expected version.

 Git tag has the expected version.

 Commit and tag are pushed with git push origin main --follow-tags.

Versioning rules

Use a patch release for backwards-compatible bug fixes:

npm run release:patch


Use a minor release for backwards-compatible features:

npm run release:minor


Use a major release for breaking changes:

npm run release:major