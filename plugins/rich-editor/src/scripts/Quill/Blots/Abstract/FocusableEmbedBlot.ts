/**
 * @author Adam (charrondev) Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license https://opensource.org/licenses/GPL-2.0 GPL-2.0
 */

import { BlockEmbed } from "quill/blots/block";

export default class FocusableEmbedBlot extends BlockEmbed {

    public domNode: HTMLElement;

    constructor(domNode) {
        super(domNode);
        this.domNode.setAttribute("contenteditable", false);
    }

    public focus() {
        this.domNode.focus();
    }
}