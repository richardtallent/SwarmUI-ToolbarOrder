using SwarmUI.Core;
using System.IO;

namespace RichardTallent.ToolbarOrder;

/// <summary>Extension that reorders and/or hides the header toolbar controls of file browsers (Models, LoRAs, Presets, etc).</summary>
public class ToolbarOrderExtension : Extension
{
    /// <summary>Optional per-user config.</summary>
    public const string UserConfigFile = "toolbar_order.user.json";

    public override void OnInit()
    {
        ScriptFiles.Add("assets/toolbar_order.js");
        if (File.Exists($"{FilePath}{UserConfigFile}"))
        {
            OtherAssets.Add(UserConfigFile);
        }
    }
}
