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

To run the project:
```
dotnet watch run
```

## Layout modification
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

## The controllers
I created a controller called `PrivateController` to help testing stuff.

## Questions
* Where (which directory) do you put these "service" classes that can be injected in controllers (and other things I imagine)?

# TODO
- [ ] Remove the old project from Github.
- [ ] Check if the CSS and JS gets minified in the default prod build, I'm not sure it does (it did in the previous Razor template).