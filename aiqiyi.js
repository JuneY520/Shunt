// 2024-01-14 18:15


const url = $request.url;
if (!$response.body) $done({});
const isIQY = url.includes("iqiyi.com/");
let obj = JSON.parse($response.body);

if (isIQY) {
  if (url.includes("/bottom_theme?")) {
    // 爱奇艺 底部tab
    if (obj?.cards?.length > 0) {
      let card = obj.cards[0];
      if (card?.items?.length > 0) {
        // 29首页 31会员中心 34我的 35发现 184随刻视频
        card.items = card.items.filter((i) => ["29", "34"]?.includes(i?._id));
        // 修复位置
        for (let i = 0; i < card.items.length; i++) {
          card.items[i].show_order = i + 1;
        }
      }
    }
  } else if (url.includes("/common_switch?")) {
    // 爱奇艺 通用配置
    if (obj?.content?.resource) {
      const items = [
        "activities",
        "ai_guide", // ai指引
        "cast_device_ad",
        "flow_promotion", // 播放器 右上角免流按钮
        "growth_award", // 播放器 会员成长积分
        "ip_restriction_ad",
        "member",
        "ppc_feed_insert",
        "second_floor_guide",
        "speed_ad",
        "vip_tips",
        "vipgrowth_value", // 播放器 会员成长体系
        "vr"
      ];
      for (let i of items) {
        delete obj.content.resource[i];
      }
    }
  } else if (url.includes("/control/")) {
    // 爱奇艺 首页左上角天气图标
    if (obj?.content?.weather) {
      delete obj.content.weather;
    }
  } else if (url.includes("/getMyMenus?")) {
    // 爱奇艺 我的页面
    if (obj?.data?.length > 0) {
      let newMenus = [];
      for (let item of obj.data) {
        if (["wd_liebiao_2", "wd_liebiao_3", "wd_liebiao_4"]?.includes(item?.statistic?.block)) {
          // 精简列表
          continue;
        } else {
          if (item?.menuList?.length > 0) {
            let newLists = [];
            for (let i of item.menuList) {
              if (i?.menuType === 121) {
                // 121有奖限时问卷
                continue;
              } else {
                newLists.push(i);
              }
            }
            item.menuList = newLists;
            newMenus.push(item);
          } else {
            newMenus.push(item);
          }
        }
      }
      obj.data = newMenus;
    }
  } else if (url.includes("/home_top_menu?")) {
    // 爱奇艺 顶部tab
    if (obj?.cards?.length > 0) {
      let card = obj.cards[0];
      if (card?.items?.length > 0) {
        // 1017直播 8196热点 4525518866820370中国梦
        card.items = card.items.filter((i) => !["1017", "8196", "4525518866820370"]?.includes(i?._id));
        for (let i = 0; i < card.items.length; i++) {
          card.items[i].show_order = i + 1;
        }
      }
    }
  } else if (url.includes("/mixer?")) {
    // 爱奇艺 开屏广告 播放广告
    if (obj?.errorCode === 0) {
      const items = ["adSlots", "splashLottieFile", "splashUiConfig"];
      for (let i of items) {
        delete obj[i];
      }
    }
  } else if (url.includes("/search.video.iqiyi.com/")) {
    // 爱奇艺 搜索框填充
    if (obj?.cache_expired_sec) {
      obj.cache_expired_sec = 1;
    }
    if (obj?.data) {
      obj.data = [{ query: "搜索内容" }];
    }
    if (obj?.show_style?.roll_period) {
      obj.show_style.roll_period = 1000;
    }
  } else if (url.includes("/views_category/")) {
    // 爱奇艺 各菜单列表 剧集 电影 综艺 信息流
    if (obj?.base?.statistics?.ad_str) {
      delete obj.base.statistics.ad_str;
    }
    if (obj?.cards?.length > 0) {
      let newCards = [];
      for (let card of obj.cards) {
        if (card?.blocks?.length > 0) {
          let newItems = [];
          for (let item of card.blocks) {
            // block_321顶部轮播广告 block_415横版独占广告标题 block_416 横版独占视频广告
            if (["block_321", "block_415", "block_416"]?.includes(item?.block_name)) {
              continue;
            } else if (item?.buttons?.[0]?.id === "ad") {
              continue;
            } else {
              newItems.push(item);
            }
          }
          card.blocks = newItems;
          newCards.push(card);
        } else {
          newCards.push(card);
        }
      }
      obj.cards = newCards;
    }
  } else if (url.includes("/views_comment/")) {
    // 爱奇艺 播放页评论区
    if (obj?.cards?.length > 0) {
      // 评论资源位 无alias_name字段的为广告
      obj.cards = obj.cards.filter(
        (i) =>
          i.hasOwnProperty("alias_name") &&
          !["comment_resource_card", "comment_resource_convention_card"]?.includes(i?.alias_name)
      );
    }
  } else if (url.includes("/views_home/")) {
    // 爱奇艺 信息流样式1
    if (obj?.base?.statistics?.ad_str) {
      delete obj.base.statistics.ad_str;
    }
    if (obj?.cards?.length > 0) {
      let newCards = [];
      for (let card of obj.cards) {
        // ad_mobile_flow信息流广告 ad_trueview信息流广告 focus顶部横版广告 qy_home_vip_opr_banner会员营销banner
        if (["ad_mobile_flow", "ad_trueview", "focus", "qy_home_vip_opr_banner"]?.includes(card?.alias_name)) {
          continue;
        } else {
          if (card?.top_banner?.l_blocks?.length > 0) {
            // 模块右边文字按钮
            for (let item of card.top_banner.l_blocks) {
              if (item?.buttons?.length > 0) {
                // 移除按钮 娱乐资源
                delete item.buttons;
              }
            }
            newCards.push(card);
          } else {
            newCards.push(card);
          }
        }
      }
      obj.cards = newCards;
    }
  } else if (url.includes("/views_plt/")) {
    // 爱奇艺 播放详情页组件
    if (obj?.kv_pair) {
      // activity_tab活动标签页 cloud_cinema云影院卡片 vip_fixed_card会员优惠购买卡片
      const items = ["activity_tab", "cloud_cinema", "vip_fixed_card"];
      for (let i of items) {
        delete obj.kv_pair[i];
      }
    }
    if (obj?.cards?.length > 0) {
      obj.cards = obj.cards.filter(
        (i) =>
          ![
            "bi_playlist", // 必播单 当下最热电影推荐
            // "cloud_cinema_detail_character", // 云影院演员列表
            // "cloud_cinema_detail_synopsis", // 云影院详情简介
            // "cloud_cinema_play_detail_tag", // 云影院详情标签
            "cloud_cinema_play_privilege", // 云影院底部文字
            "cloud_cinema_playlist", // 云影院播单
            "cloud_cinema_playlist_1", // 云影院播单2
            "cloud_cinema_playlist_2", // 云影院播单3
            // "cloud_cinema_preview_collection", // 云影院预告片选集
            "cloud_cinema_privilege_icon", // 云影院内容权益
            "cloud_cinema_star_activities", // 云影院推广横幅
            "play_ad_no_vip", // 视频关联广告
            "play_around", // 周边视频 短视频
            // "play_collection", // 选集
            "play_custom_card", // 偶像练习生定制卡片
            // "play_detail_tag", // 详情标签
            // "play_rap_custom", // 综艺 svip舞台纯享
            // "play_series_collection", // 综艺 选集 看点
            "play_splendid_collection", // 综艺 合集 正片没有的都在这里
            "play_type_topical_card_3", // 综艺 幕后花絮
            "play_type_topical_card_4", // 综艺 精彩二创
            "play_variety_custom_2", // 综艺 精彩看点
            "play_vertical", // 综艺 竖屏内容
            "play_vip_promotion", // 会员推广
            "play_water_fall_like", // 猜你喜欢
            "play_water_fall_like_title", // 猜你喜欢标题
            "plt_cloud_cinema_photo", // 云影院剧照 清晰度低
            // "plt_cloud_cinema_short1", // 云影院官方短视频
            "plt_cloud_cinema_short2", // 云影院短视频剪辑
            "plt_playlist", // 播单
            "plt_playlist_1", // 播单2
            "plt_playlist_2", // 播单3
            "funny_short_video" // 精彩短视频
          ]?.includes(i?.alias_name)
      );
    }
  } else if (url.includes("/views_search/")) {
    // 爱奇艺 搜索结果列表
    if (obj?.cards?.length > 0) {
      let newCards = [];
      for (let card of obj.cards) {
        if (
          [
            "ad_mobile_flow", // 信息流广告
            "hot_query_bottom", // 底部图标
            "hot_query_search_top_ad", //顶部广告
            "search_com_related_query", // 相关搜索
            "search_intent_detail_onesearch", // 为你推荐信息流
            "search_mid_text_ad", // 底部广告
            "search_onebox_v2", // 搜索界面 赢年卡
            "search_small_card_ad", // 搜索短视频小图广告
            "search_topbanner_text", // 为你推荐标题
            "search_vip_banner" // vip营销
          ]?.includes(card?.strategy_com_id)
        ) {
          continue;
        } else {
          // 相关内容推荐 相关短视频
          if (card?.blocks?.length > 0) {
            let newBlocks = [];
            for (let i of card.blocks) {
              if (i.hasOwnProperty("block_name")) {
                newBlocks.push(i);
              } else if (i.hasOwnProperty("block_type")) {
                if (![861, 959]?.includes(i?.block_type)) {
                  // 861搜索页精确搜索时 第一个自动播放的内容
                  // 959广告
                  newBlocks.push(i);
                }
              }
            }
            card.blocks = newBlocks;
            newCards.push(card);
          } else {
            newCards.push(card);
          }
        }
      }
      obj.cards = newCards;
    }
  } else if (url.includes("/waterfall/")) {
    // 爱奇艺 信息流样式2
    if (obj?.base?.statistics?.ad_str) {
      delete obj.base.statistics.ad_str;
    }
    if (obj?.cards?.length > 0) {
      let newCards = [];
      for (let card of obj.cards) {
        if (card.hasOwnProperty("block_class")) {
          // 有block_class字段的为广告
          continue;
        } else {
          if (card?.blocks?.length > 0) {
            let newItems = [];
            for (let item of card.blocks) {
              if (item.hasOwnProperty("block_class")) {
                // 有block_class字段的为广告
                continue;
              } else {
                newItems.push(item);
              }
            }
            card.blocks = newItems;
            newCards.push(card);
          } else {
            newCards.push(card);
          }
        }
      }
      obj.cards = newCards;
    }
  }
}

$done({ body: JSON.stringify(obj) });