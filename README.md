# Password Manager Web App
I had to reinitialize the project because I initially started working on the older Razor template which has JQuery and a Carousel on the home page. Yeah I'm not kidding.

They ditched the carousel but Bootstrap and JQuery are still there.

Created the project using the "razor" template as in:
```
dotnet new razor
```
And this is where I should probably have used PascalCase for the root directory. I also found out I probably should have created a sln and multiple projects inside that sln. Oh well.

I added the CLI project I started that has some of the model classes using a git submodule (I'm so sorry) into the submodules folder.

**Make sure to manually checkout the submodule directory or nothing will work**.

Then added the project to the main .csproj using:
```
dotnet add reference submodules/PasswordManagerTools/PasswordManagerTools.csproj
```

We then need to tell the compiler to stop trying to watch all the files inside submodules, which is achieved by adding this to our main csproj:
```xml
<PropertyGroup>
  <DefaultItemExcludes>$(DefaultItemExcludes);submodules\**</DefaultItemExcludes>
</PropertyGroup>
```

## Dependencies
You need NodeJS 10+.

I use Parcel.JS to bundle static assets. Since Parcel weighs more than 90MB I started installing it globally, so it's not in package.json and is called through npx.

Make sure parcel is installed globally:
```
npm install -g parcel-bundler
```

## Configuration


## Running the project

To run the project:
```
npm run dev
```

## Building for production
Use the following to create a Windows exe:
```
dotnet publish --configuration Release -r win-x64
```
The build is in the `bin/Release/netcoreapp2.2/<TARGET>/publish directory`. There are a lot of files in there, one of which is executable.

The command initially gave me an error in that it was supposed to use donet Core 2.2.0 but would be using 2.2.2 instead.

There are two possible fixes in the .csproj. The first one is to specify both the target runtime version, and the runtime identifies you want to use. They provided the following example (supposed to go in the first PropertyGroup):

```xml
<RuntimeFrameworkVersion>2.1.1</RuntimeFrameworkVersion>
<PlatformTarget>AnyCPU</PlatformTarget>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
```

What I'm doing it just adding the following line:
```xml
<TargetLatestRuntimePatch>true</TargetLatestRuntimePatch>
```

Actually it took me forever to notice the issue came from the submodule .csproj, the PasswordManagerTools project.

I just had to also add the TargetLatestRuntimePatch to the .csproj over there and publish worked.

Except my app still redirects to HTTPS, so I commented the line that does that in Startup.cs.
More importantly, the static assets are not there at all.

For what I want to do I'm pretty sure I need to use OutOfProcess hosting and not InProcess (which means we're supposed to put it inside IIS or something). OutOfProcess is supposed to be the default and uh... Yeah I'm not sure if it's even using that option but let's overwrite it anyway in the csproj:
```xml
<AspNetCoreHostingModel>OutOfProcess</AspNetCoreHostingModel>
```

The static content is still absent from the exe. I found [a page](https://www.learnrazorpages.com/publishing/publish-to-iis#including-static-content-in-the-root-folder) that seems to explain my issue.

The "good" news is that this confirms the app is not bundling/minifying anything in that state. It's possible to add a NuGet package to do it, or we do it ourselves. It could even be done in a separate project.

I'm going to need npm for client encryption packages so I might as well setup a bundler like Parcel. More on that later.

## Layout modifications
I had to heavily modify the existing pages since I don't want Bootstrap, JQuery etc.

The `_Layout.cshtml` file had these entries in head:
```html
<environment include="Development">
  <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
</environment>
<environment exclude="Development">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
        asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute"
        crossorigin="anonymous"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"/>
</environment>
```

Then there's the cookie warning partial (lel):
```html
<partial name="_CookieConsentPartial" />
```

And at the end of body the script tags:
```html
<environment include="Development">
  <script src="~/lib/jquery/dist/jquery.js"></script>
  <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.js"></script>
</environment>
<environment exclude="Development">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"
        asp-fallback-src="~/lib/jquery/dist/jquery.min.js"
        asp-fallback-test="window.jQuery"
        crossorigin="anonymous"
        integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=">
  </script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js"
        asp-fallback-src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"
        asp-fallback-test="window.jQuery && window.jQuery.fn && window.jQuery.fn.modal"
        crossorigin="anonymous"
        integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o">
  </script>
</environment>
```

## Doing REST with Razor pages
It's possible. Although you still need a "Controller". I think it's probably best to just use one these Controller things.

Otherwise, check this out: https://www.learnrazorpages.com/web-api

We can easily scaffold a controller using a tool that we need to install first:
```
dotnet tool install --global dotnet-aspnet-codegenerator
```

Then that generator should work out for us:
```
dotnet-aspnet-codegenerator -p "C:\MyProject\MyProject.csproj" controller -name MyDemoModelController -api -m My.Namespace.Models.MyDemoModel -dc MyDemoDbContext -outDir Controllers -namespace My.Namespace.Controller
```

But I think I'm going to skip to GraphQL immediately, see following section.

## GraphQL
**NB**: At some point I just decided not to use GraphQL. I have very few endpoints and the convoluted security stuff I'm stringing in would make everything a little too crazy.

We're going to need the NuGET package from here: https://graphql-dotnet.github.io/

We can add the package to the csproj file using the following command:
```
dotnet add package GraphQL
```

Then [this article](https://medium.com/@mczachurski/graphql-in-net-core-project-fb333241ff0a) explains how to create a controller to provide the graphql endpoint.

There is an example GraphQL API from the author [here](https://github.com/BibliothecaTeam/Bibliotheca.Server.Gateway/tree/master/src/Bibliotheca.Server.Gateway.Api).

Since that guy uses some sort of dependency injection thingy I turned to [another article](https://fullstackmark.com/post/17/building-a-graphql-api-with-aspnet-core-2-and-entity-framework-core).
That article also explains how to install GraphiQL. But I won't be usin git.

### The schema
I got a list of names and associated passwords.

We should create the types associated with that schema, which is pretty simple.

We're going to create a basic class called `Models/PasswordEntry` and its related GraphQL type: `Models/PasswordEntryType`.

We should then create the Query and Mutation objects resolvers thingies accessors of whatnot.

* Models/PasswordManagerQuery
* Models/PasswordManagerMutation

And finally: Models/PasswordManagerSchema.

## The API
I should probably document it at some point. I might not.

All the endpoints are in `ApiController.cs`. Client-side code is in `api.js`.

They all use the POST method.

## Assets bundling
I think the easiest plan is to npm init the project directory and reference bundled files in `_Layout.cshtml` in the link and script tags (output to wwwroot and the right subdirectories).

We should then be able to rely on the `asp-append-version="true"` to help us with cache busting as it adds a ?v= query to the URL. We'll have to check if that actually works with the release package.

I think it's possible to create tasks to run before `dotnet build` takes place but we might as well do everything from npm.

I need to include wwwroot to the final build. There is a Folder entry to add to the csproj as shown in [this example](https://github.com/NetCoreTemplates/parcel/blob/master/MyApp/MyApp.csproj).

So I added this section to my csproj:
```xml
<ItemGroup>
  <Folder Include="wwwroot\" />
</ItemGroup>
```

For future reference, if we want to use the bundler to add a version string and include that script regardless of the version or hash it's possible too, using a tag such as:
```html
<script asp-src-include="~/js/app_*.js"></script>
```

### Parcel
I thought of using Rollup this time but I just reverted to Parcel.

What we want to do is create some sort of source directory that outputs to wwwroot. I chose to use "src" although it's a tiny bit confusing.

We can import the CSS in the JS entry point and Parcel will output a CSS file as well.

The "src" directory should be ignored by the dotnet compiler, which we can ensure it is by modifying the DefaultItemExclude (that we should already have since we also exclude "submodules"):

```xml
<PropertyGroup>
  <DefaultItemExcludes>$(DefaultItemExcludes);submodules\**;src\**</DefaultItemExcludes>
</PropertyGroup>
```

## Client-side encryption
I'm going to have to be able to encrypt and decrypt similarily between my two different AES libraries.

In JS I think I'm going to use the [aes-js](https://www.npmjs.com/package/aes-js) package.

I carried out experiments on [another repository](https://github.com/dkvz/node-encryption-experiment) although this is specific to Node and will have to be adapted to the browser. We'll also need to check for the presence of the window.crypto API.

-> I put the unsupported browser check in Index.cshtml.

We need a few libraries for which we add a specific version:
```
npm install -D --save-exact aes-js@3.1.2
npm install -D --save-exact pbkdf2@3.0.17
```

There is a problem with pbkdf2 which is using Buffer, which does not exist in browsers. It's apparently "polyfilled" by some Browserify addon.

If I really want to use Buffer, [there is a Buffer](https://www.npmjs.com/package/buffer) npm package that looks promising enough.

Or, I might just use something that is native to the crypto API with examples I found here: https://github.com/diafygi/webcrypto-examples#pbkdf2

You need to importKey first, the deriveKey.

I made a horrible pen that seems to work:
```js
const key = 'test';

// Need to convert the string to byte array.

// When you're a normal person you use TextEncoder.

const enc = new TextEncoder();

window.crypto.subtle.importKey(
    "raw", //only "raw" is allowed
    enc.encode(key), //your password
    {
        name: "PBKDF2",
    },
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ["deriveKey", "deriveBits"] //can be any combination of "deriveKey" and "deriveBits"
)
.then(function(key){
    //returns a key object
    console.log('Imported key: ' + key);
    window.crypto.subtle.deriveBits(
    {
        "name": "PBKDF2",
        salt: window.crypto.getRandomValues(new Uint8Array(16)),
        iterations: 10000,
        hash: {name: "SHA-1"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    key, //your key from generateKey or importKey
    256 //the number of bits you want to derive
    )
    .then(function(bits){
        //returns the derived bits as an ArrayBuffer
        console.log(new Uint8Array(bits));
    })
    .catch(function(err){
        console.error(err);
    });
})
.catch(function(err){
    console.error(err);
});
```

## Sessions cleanup
I'm implementing my own session mechanic using a singleton that stays in memory for the app lifetime.

For the automatic cleaning up I should look up background tasks: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-2.2

## App. configuration file
I'm probably going to need some way to configure the password database paths (app will allow declaring multiple ones).

[This Stackoverflow answer](https://stackoverflow.com/questions/31453495/how-to-read-appsettings-values-from-json-file-in-asp-net-core) offers a lot of details including how to to dependency injection of the config object.

And the official documentation: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-2.2

It's possible to create one config file per environment (dev and prod that is). I'm probably going to do that and let people create the prod config file.

Btw the sequence is supposed to be a secret. Not as secret as the master password, but still secret. Hide the one you use in prod and change it sometimes.

The dataPath key identifies where the data files are supposed to be stored.

```json
{
  "sequence":"2,1;2,2;2,3",
  "dataPath": "var/data/",
  "dataFiles": [
    "main.pwd"
  ]
}
```

Since we use `CreateDefaultBuilder` in Startup.cs, it's actually supposed to automatically pick up all the appsettings.json files (base one which would have priority when they get merged (I think they get merged?), and the two with environment names).

For some reason the app created the json files when I ran it.

It's possible to manually bind a class to the configuration data (or part of it) but I'm going more generic using a more general way of getting the values as shown in the following example (which should also inject the configuration):
```cs
public class IndexModel : PageModel
{
  public IndexModel(IConfiguration config)
  {
    _config = config;
  }

  public int NumberConfig { get; private set; }

  public void OnGet()
  {
    NumberConfig = _config.GetValue<int>("NumberKey", 99);
  }
}
```

## Testing
It looks like you're normaly supposed to have a separate "test project". I could put it in submodules/ since I'm already using a separate project in there, that should NOT be in there.

I should've created a "sln" at the start and adding projects to it. Instead I created a project using the "razor" template, and added another in submodules while making sure that directory gets ignored by the compiler for the current project.

It's kind of a mess.

It might be possible to include the testing to the same project automatically, I still have to try it.

```
cd submodules
mkdir Tests
cd Tests
dotnet new nunit
```

Now we have to reference the test project into the main project (not necessary but will make `dotnet test` work in the root directory) and also reference the razor project from the test project.

I tried adding the reference to the Tests project inside the main csproj but it doesn't make the `dotnet test` command work from the root, so I deleted it.

In Tests.csproj:
```xml
<ItemGroup>
  <ProjectReference Include="../../PasswordManagerApp.csproj" />
</ItemGroup>
```

To run the tests I need to do:
```
dotnet test submodules/Tests
```

To make it easier I added that as an npm script and thus can use:
```
npm test
```

# TODO
- [x] Remove the old project from Github -> Made it private.
- [x] Use CSS variables while I'm at it.
- [x] There doesn't seem to be a handler for error 404s -> Quick fixed this by adding `app.UseStatusCodePages();``in Startup.cs. Not awesome but it works.
- [ ] Email notifications for failed login attempts, log all the successful logins somewhere.
- [ ] Log all of the attempts somwhere.
- [x] The `asp-append-version="true"` thing doesn't work at all with the production release, the version ID's are gone. -> It does work, the correct exe is in PasswordManagerApp\bin\Release\netcoreapp2.2\win-x64\publish or equivalent.
- [x] I have a 404 on the source maps - They don't seem to be available through Kestrel, probably because they're referenced as being at the root in the files (as in /sites.css.map instead of /assets/sites.css/map) (we juste need to add --public-url to parcel).
- [x] Add Babel just for the fun of it and also because my cheap browser check in Index.cshtml encompasses browsers that have no ES6 support -> Parcel just auto babelifies ES6.
- [ ] Double check if the ClientIp we save in SecureSession objects works with X-Forwarded-For when deployed in production, because there's some chance it doesn't.
- [x] Uses or Random in PasswordManagerTools should be replaced with the secured version - It's a TODO item in that project as well -> For what it's used over there it does'nt matter.
- [ ] SessionManager is not thread safe. But I think that would be one of the worst cost/benefit change I could make.
- [ ] A cookie called .AspNet.Consent is sent with requests. We might want to get rid of it.
- [ ] TestRequest.cs should be removed.
- [x] Re-test the whole session clean up thing.
- [x] The file selected at login has to be sanitized before it's used on the backend. We should probably just send the position in the list.
- [x] Change the title when the view changes.
- [ ] I do not know what happens if some of the source strings provided are empty - I should check for empty data in the API endpoints.
- [x] Add some sort of spinner when doing the API requests.
- [ ] There should also be some sort of spinner while we're initializing the index page and processing the JS in site.js.
- [x] I don't think the calls to System.GC.Collect() do anything super helpful in the PasswordManagerTools project. I feel like they're slowing everything down by a lot. I should remove them.
- [x] The password list (HTML select element) looks terrible. Can we do something with the CSS? -> Not really if using the select element as is.
- [ ] Add a margin left to the close icon for the toaster message, make it bigger too.
- [ ] Add some sort of check that shows a warning if the connection is not in HTTPS.
- [ ] Lock an IP address that does too many failed login attempts.
- [ ] App. directory structure is messed up. I should have a sln project referencing all the others (including the Test project) and have better naming for the directories with C# or JS code.
- [ ] Show an unsaved changes warning message (using the warning colours) in the notification section when saves need to happen, also show the save button (hide otherwise).
- [ ] I have serious issues with using text inputs in flex rows, when you resize to minimum width some of the inputs are sticking out of the viewport. We might need a width: 100% on body or something (might also be I need display: block instead of inline).
- [x] To open a new session I created something in SessionManager that returns an enum member. To save the session I did it almost entirely in ApiController. I should be consistent here and pick one or the other. Some methods in ISessionManager won't be needed anymore after the refactoring.
- [ ] We could have a big setTimeout that automatically disconnects the session for inactivity, reset or disable it when interacting with the UI.
- [ ] I'm not super sure what happens if a password is longer than 16 characters. It should pad to always be a multiple of 16 bytes but I should test it. In the same vein I also need to test a password that is exactly 16 characters to see if my JS de-padding works in that case too.
- [ ] The password field on the second slide show the number of characters in the password; I should probably use placeholder text or find an option to hide the number of characters.
- [ ] In the JS code there are byte arrays I could clean up from memory at some point but I usually don't bother.
- [ ] The copy to clipboard thingy should first look if hiddenPasswordInput.value is empty and copy the visible field instead in that case.