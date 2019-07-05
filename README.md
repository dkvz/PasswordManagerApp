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
We're going to need the NuGET package from here: https://graphql-dotnet.github.io/

We can add the package to the csproj file using the following command:
```
dotnet add package GraphQL
```

Then [this article](https://medium.com/@mczachurski/graphql-in-net-core-project-fb333241ff0a) explains how to create a controller to provide the graphql endpoint.

There is an example GraphQL API from the author [here](https://github.com/BibliothecaTeam/Bibliotheca.Server.Gateway/tree/master/src/Bibliotheca.Server.Gateway.Api).

Since that guy uses some sort of dependency injection thingy I turned to [another article](https://fullstackmark.com/post/17/building-a-graphql-api-with-aspnet-core-2-and-entity-framework-core).
That article also explains how to install GraphiQL. But I won't be usin git.

## The schema
I got a list of names and associated passwords.

We should create the types associated with that schema, which is pretty simple.

We're going to create a basic class called `Models/PasswordEntry` and its related GraphQL type: `Models/PasswordEntryType`.

We should then create the Query and Mutation objects resolvers thingies accessors of whatnot.

* Models/PasswordManagerQuery
* Models/PasswordManagerMutation

And finally: Models/PasswordManagerSchema.

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

## WHAT NOW
I have to change how sessions are saved so I can easily find one using hash(hash(sequence) + SessionID). I'm probably going to need a dictionnary using hex representations of the hashes since that's what I'm going to send in JSON.

# TODO
- [x] Remove the old project from Github -> Made it private.
- [ ] Check if the CSS and JS gets minified in the default prod build, I'm not sure it does (it did in the previous Razor template).
- [x] Use CSS variables while I'm at it.
- [x] There doesn't seem to be a handler for error 404s -> Quick fixed this by adding `app.UseStatusCodePages();``in Startup.cs. Not awesome but it works.
- [ ] Email notifications for failed login attempts, log all the successful logins somewhere.
- [x] The `asp-append-version="true"` thing doesn't work at all with the production release, the version ID's are gone. -> It does work, the correct exe is in PasswordManagerApp\bin\Release\netcoreapp2.2\win-x64\publish or equivalent.
- [ ] I have a 404 on the source maps - They don't seem to be available through Kestrel, probably because they're referenced as being at the root in the files (as in /sites.css.map instead of /assets/sites.css/map) (we juste need to add --public-url to parcel).
- [ ] Add Babel just for the fun of it and also because my cheap browser check in Index.cshtml encompasses browsers that have no ES6 support.
- [ ] Double check if the ClientIp we save in SecureSession objects works with X-Forwarded-For when deployed in production, because there's some chance it doesn't.
- [ ] Uses or Random in PasswordManagerTools should be replaced with the secured version - It's a TODO item in that project as well.
- [ ] SessionManager is not thread safe. But I think that would be one of the worst cost/benefit change I could make.
- [ ] A cookie called .AspNet.Consent is sent with requests. We might want to get rid of it.
- [ ] TestRequest.cs should be removed.
