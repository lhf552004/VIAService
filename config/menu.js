/**
 * Created by pi on 7/22/16.
 */

var ConfigureMenus = [
    {
        name: 'Immigration Services',
        SubMenus: [
            {
                name: 'Students',
                url: '/:student',
                keepPage: true
            },
            {
                name: 'Privatiers',
                url: '/:privatiers',
                keepPage: true
            },
            {
                name: 'Entrepreneurs',
                url: '/:entrepreneurs',
                keepPage: true
            },
            {
                name: 'Expatriates',
                url: '/:expatriates',
                keepPage: true
            }
        ],
        url: '#'
    },
    {
        name: 'Resources',
        url: '#',
        keepPage: true
    },
    {
        name: 'Contact',
        SubMenus: [
            {
                name: 'Impressum',
                navigation : true,
                url: '#',
                keepPage: true

            }
        ],
        url: '#'
    },
    {
        name: 'FAQ',
        url: '#'
    }

    // {
    //     name: 'Language',
    //     SubMenus: [
    //         {
    //             name: 'English',
    //             keepPage: true,
    //             url: '/en'
    //         },
    //         {
    //             name: 'Chinese',
    //             keepPage: true,
    //             url: '/zh'
    //         },
    //         {
    //             name: 'Russian',
    //             keepPage: true,
    //             url: '/ru'
    //         }
    //     ],
    //     url: '#'
    // }
];
module.exports = ConfigureMenus;