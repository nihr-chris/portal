var templates = {"widgets.toggle.html":"{{# enabled }}\n    {{# value }}\n    <li class=\"active\"><a href=\"#\" on-click=\"toggle\">{{label}}</a></li>\n    {{/#}}\n    {{# !value }}\n    <li class=\"active\"><a href=\"#\" on-click=\"toggle\">{{label}}!</a></li>\n    {{/#}}\n{{else}}\n<li class=\"disabled\"><a href=\"#\">{{label}}</a></li>\n{{/#}}\n","widgets.panel.html":"<div class=\"panel panel-{{ type ? type : 'default'}}\">\n    <div class=\"panel-heading\">\n        {{ title }}\n    </div>\n    <div class=\"panel-body\">\n        {{ yield }}\n    </div>\n</div>\n","widgets.multidropdown.html":"<li class=\"dropdown\">\n    <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">{{ title }} <span class=\"caret\"></span></a>\n    <ul class=\"dropdown-menu\" role=\"menu\">\n        {{# items}}\n            {{# contains(selected, this) }}\n            <li class=\"active\">\n                <a href=\"#\" on-click=\"select\">{{ format(this) }}</a>\n            </li>\n            {{else}}\n            <li>\n                <a href=\"#\" on-click=\"select\">{{ format(this) }}</a>\n            </li>\n            {{/#}}\n        {{/#}}\n    </ul>\n</li>","widgets.dropdown.html":"<li class=\"dropdown\">\n    <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">{{ format(selected) }} <span class=\"caret\"></span></a>\n    <ul class=\"dropdown-menu\" role=\"menu\">\n        {{# items}}\n            {{# this === selected }}\n            <li class=\"active\">\n                <a href=\"#\">{{ format(this) }}</a>\n            </li>\n            {{/#}}\n            {{# this !== selected}}\n            <li>\n                <a href=\"#\" on-click=\"select\">{{ format(this) }}</a>\n            </li>\n            {{/#}}\n        {{/#}}\n    </ul>\n</li>","timetarget.html":"<panel title=\"Time & Target\">\n    <controlbar>\n        <multidropdown title='Trusts' items=\"{{memberOrgs}}\" selected=\"{{selectedOrgs}}\"></multidropdown>\n    </controlbar>\n    \n    <barchart\n        data='{{timeTargetGraphData}}'\n        group-spacing='10'>\n    </barchart>\n</panel>\n","recruitmentPerformance-yy.html":"<panel title=\"Annual recruitment performance\">\n    <controlbar>\n        <dropdown items=\"{{filterModeOptions}}\" selected=\"{{filterMode}}\"></dropdown>\n        <dropdown items=\"{{commercialOptions}}\" selected=\"{{commercial}}\"></dropdown>\n        <toggle label=\"Weighted\" value=\"{{weighted}}\"></toggle>\n    </controlbar>\n    \n    <controlbar>\n        <multidropdown \n            title={{filterMode.split(\" \")[1] + \"s\"}} \n            items=\"{{filterItems}}\" \n            selected=\"{{selectedFilterItems}}\"></multidropdown>\n    </controlbar>\n    \n    <barchart\n        data='{{annualRecruitmentData}}'\n        legend='{{examplelegend}}'\n        width='2000'\n        y-label=''\n        group-spacing='10'>\n    </barchart>\n    \n    <datatable \n        headers='{{ [\"\", \"2012-13\", \"2013-14\", \"2014-15\"] }}'\n        keys='{{ [\"grouping\", \"2012\", \"2013\", \"2014\"] }}' \n        data='{{tabledata}}'>\n    </datatable>\n</panel>\n","overview.html":"<div class='row'>\n    <div class='col-xs-12'>\n        <h1>Percentage of recruitment target met</h1>\n    </div>\n</div>\n\n<div class='row'>\n    <div class='col-xs-12'>\n        <h1>Proportion of studies recruiting to time & target</h1>\n    </div>\n</div>\n","master-detail.html":"<div class='row'>\n    <div class='col-xs-4 sidebar'>\n        {{#options}}\n        <div class='row'>\n            <div class='col-xs-12'>\n                <a href='#' class='{{id === current ? \"active\" : \"inactive\"}}' on-click='optionSelected'>\n                    {{title}}\n                </a>\n            </div>\n        </div>\n        {{/#}}\n    </div>\n    <div class='col-xs-6' id='detail'>\n    </div>\n</div>\n","filter.html":"{{# rows}}\n<div class='row'>\n    <div class='col-sm-12'>\n        <div class=\"btn-toolbar filterrow datafilter\" role=\"toolbar\">\n            <div class='btn-group btn-group-xs'>\n                <button on-click='delete' type=\"button\" class=\"close\">\n                    <span aria-hidden=\"true\">&times;</span>\n                    <span class=\"sr-only\">Delete</span>  \n                </button>\n            </div>  \n            <div class='btn-group'>\n                <button type=\"button\" class=\"btn btn-xs colorindicator\" style='background-color:{{dataColor}}'>\n                </button>\n            </div>\n            <div class='btn-group'>\n                {{# this.filters() }}\n                <dropdown options='{{options}}' index='{{selectedIndex}}'/>\n                {{/}}\n            </div>\n        </div>\n    </div>\n</div>\n{{/rows}}\n\n<div class='row'>\n    <button on-click=\"insert\" type=\"button\" class=\"btn btn-default\">Add</button>\n</div>\n","datatable.html":"<table class=\"table\">\n    <thead>\n        {{# headers ? headers : keys }}\n        <th>{{.}}</th>\n        {{/}}\n    </thead>\n    <tbody>\n        {{# rows }}\n        <tr>\n            {{# this }}\n            <td>{{.}}</td>\n            {{/}}\n        </tr>\n        {{/}}\n    </tbody>\n</table>\n"}; module.exports = function(name) { return templates[name] };