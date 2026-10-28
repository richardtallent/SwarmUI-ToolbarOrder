# SwarmUI-ToolbarOrder

This [SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI) extension reorders and/or hides the header toolbar controls of the file browsers (Models, LoRAs, VAEs, Embeddings, ControlNets, Wildcards, Presets, Image History, and any extension-made browser).

## Install

Clone into `src/Extensions/` of your SwarmUI, then restart.

## Configure

The built-in configuration is the order I prefer, since it puts controls I use most often to the left, which is helpful for me when running with a smaller browser window and vertical layouts.

If you want to replace or tweak those, create a `toolbar_order.user.json` file.

```json
{
    browsername: {
        order: [tokens...],
        hide: [tokens...]
    }
}
```

The values for `browsername` for the standard browsers are `modelbrowser`, `sdvaebrowser`, `sdlorabrowser`, `sdembedbrowser`, `sdcontrolnetbrowser`, `wildcardsbrowser`, `presetbrowser`, `imagehistorybrowser`, `inputimagebrowser`, `simpletabbrowser`, and `comfyworkflowbrowser`.

You can also use `default` to set defaults for all browsers that don't have their own key.

All of these are optional.

Inside those:

- `order` is an optional array of tokens to set the order you like for the components
- `hide` is an optional array of tokens for components you want to hide

The "tokens" are just strings this extention knows how to match up to actual controls. The "standard" supported controls are `refresh`, `up`, `multiselect`, `format`, `sort`, `reverse`, `filter`, `depth`, and `allow-anims`.

Text buttons are also supported, such as the ones in the Presets browser. The token is a prefix match of the slug of their text. For example, `create-new`, would match `Create New` or `Create New Preset`.

Anything you put in the token list that isn't recognized is ignored.

Anything you *don't* mention in `order` remains in its relative order, after the ones you *did* specify. You can set a place for the unmentioned ones with the special token `*`.

## Caveats

The folder breadcrumbs and item counts can't be controlled with this extension, since Swarm recreates them regularly. So they are always at the end.

## License

MIT, see `LICENSE`.
