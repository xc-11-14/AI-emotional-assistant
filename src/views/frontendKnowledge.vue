<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <img src="../assets/images/book.png" style="width: 60px; height: 60px;">
        <h1>知识库</h1>
      </div>
    </div>
    <div class="content">
      <!-- 左侧菜单 -->
      <div class="recommend-section">
        <div class="section-title">
          <span>推荐阅读</span>
        </div>
        <ul class="recommend-list">
          <li v-for="item in recommendList" :key="item.id" class="recommend-item" @click="goToDetail(item.id)">
            <h4>{{ item.title }}</h4>
            <p class="read-count">
              <el-icon>
                <Histogram />
              </el-icon>
              <span>阅读量：{{ item.readCount }}</span>
            </p>
          </li>
        </ul>
      </div>
      <!-- 右侧内容 -->
      <ul class="article-list">
        <li v-for="item in articleList" :key="item.id" class="article-item" @click="goToDetail(item.id)">
          <img :src="getCoverImage(item.coverImage)" style="width: 240px; height: 150px;">
          <div class="info">
            <div class="title">
              <h3>{{ item.title }}</h3>
              <el-tag Plain type="primary">{{ item.tags }}</el-tag>
            </div>
            <div style="margin-top: 10px;">
              <div class="flex-box">
                <el-icon>
                  <Avatar />
                </el-icon>
                <span>{{ item.authorName }}</span>
              </div>
              <div class="flex-box">
                <el-icon>
                  <List />
                </el-icon>
                <span>{{ dayjs(item.updateedAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
            </div>
            <div style="margin-top: 10px;">
              <div class="flex-box">
                <el-icon>
                  <Platform />
                </el-icon>
                <span>观看人数：{{ item.readCount }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination style="margin-top: 25px;" layout="prev, pager, next" :total="pagination.total"
        v-model:current-page="pagination.currentPage" v-model:page-size="pagination.size"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getRecommendArticleList } from '@/api/admin'
import { Histogram, Avatar, List, Platform } from '@element-plus/icons-vue'
import { dayjs } from 'element-plus'
import { filePath } from '@/config'
// 推荐文章列表
const recommendList = ref<any>([])
// 右侧文章列表
const articleList = ref<any>([])
// 分页参数
const pagination = ref<{ total: number, size: number, currentPage: number }>({
  total: 0,
  size: 10,
  currentPage: 1,
})
onMounted(async () => {
  const res = await getRecommendArticleList({
    sortField: 'readCount',
    sortDirection: 'desc',
    currentPage: '1',
    size: '10'
  })
  recommendList.value = res.data.data.records || []
  getPageList()
})
//获取列表数据
const getPageList = async () => {
  const res = await getRecommendArticleList({
    sortField: 'publishedAt',
    sortDirection: 'desc',
    currentPage: '1',
    size: '10'
  })
  articleList.value = res.data.data.records || []
  pagination.value.total = res.data.data.total || 0
}
//获取封面图片
const getCoverImage = (url: string) => {
  return url ? `${filePath}${url}` : 'https://file.itndedu.com/psychology_ai.png'
}
// 分页
const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val
  getPageList()
}
//跳转详情页
const goToDetail = (id: string) => {
  window.open(`/knowledge/article/${id}`)
}
</script>

<style scoped lang="scss">
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
    }
  }

  .header-section {
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;
      overflow-x: hidden;
      overflow-y: scroll;

      .section-title {
        font-size: 12;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;

          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        cursor: pointer;

        .info {
          margin-left: 20px;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
}
</style>