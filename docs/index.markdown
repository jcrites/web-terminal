---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

WebTerminal is a complete re-imagining of the command-line environment, designing it from the ground up to take full advantage of browser technology. As a simplification, WebTerminal is a developer tool that provides a command-line environment where programs display their output as HTML rendered into a WebView.

A full (unordered) list of articles is below. We recommend starting with [Introduction](introduction).

<ul>
{% for page in site.pages %}
  {% if page.categories contains 'webterminal' %}
    <li style="margin-bottom: 0.5em;"><a href="{{page.url | relative_url}}" style="font-weight: bold;">{{ page.title }}</a>. {{page.description}}</li>
  {% endif %}
{% endfor %}
</ul>
