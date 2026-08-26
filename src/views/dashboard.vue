<template>
    <div v-loading="loading">
        <PageHead title="数据分析" />
        <div class="dashboard-container" >
            <el-row :gutter="20" v-if="summary">
                <el-col :span="6">
                    <el-card>
                        <div class="card-content">
                            <div class="avatar users">
                                <img style="width: 40px; height: 40px;" src="@/assets/images/users.png" alt="">
                            </div>
                            <div class="info">
                                <div class="title">总用户数</div>
                                <div class="value">{{ summary.systemOverview.totalUsers }}</div>
                                <div class="subtitle-title">活跃用户：{{ summary.systemOverview.activeUsers }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card>
                        <div class="card-content">
                            <div class="avatar like">
                                <img style="width: 40px; height: 40px;" src="@/assets/images/like.png" alt="">
                            </div>
                            <div class="info">
                                <div class="title">情绪日志</div>
                                <div class="value">{{ summary.systemOverview.totalDiaries }}</div>
                                <div class="subtitle-title">今日新增：{{ summary.systemOverview.todayNewDiaries }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card>
                        <div class="card-content">
                            <div class="avatar comments">
                                <img style="width: 40px; height: 40px;" src="@/assets/images/comments.png" alt="">
                            </div>
                            <div class="info">
                                <div class="title">咨询对话</div>
                                <div class="value">{{ summary.systemOverview.totalSessions }}</div>
                                <div class="subtitle-title">今日新增：{{ summary.systemOverview.todayNewSessions }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card>
                        <div class="card-content">
                            <div class="avatar smile">
                                <img style="width: 40px; height: 40px;" src="@/assets/images/smile.png" alt="">
                            </div>
                            <div class="info">
                                <div class="title">平均情绪</div>
                                <div class="value">{{ summary.systemOverview.avgMoodScore }}/10</div>
                                <div class="subtitle-title">情绪健康指数</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;" v-if="summary">
                <el-col :span="12">
                    <el-card style="width: 100%;">
                        <template #header>
                            <div>情绪趋势分析</div>
                        </template>
                        <div class="chart-content">
                            <div ref="emotionChartRef" style="height: 300px;width: 100%;"></div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card style="width: 100%;">
                        <template #header>
                            <div>咨询会话统计</div>
                        </template>
                        <div class="chart-content">
                            <div class="consultation-stats">
                                <div class="stat-item">
                                    <div class="stat-label">总会话数</div>
                                    <div class="stat-value">{{ summary.consultationStats.totalSessions }}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">平均时长</div>
                                    <div class="stat-value">{{ summary.consultationStats.avgDurationMinutes }}分钟
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">活跃用户</div>
                                    <div class="stat-value">{{ summary.systemOverview.activeUsers }}</div>
                                </div>
                            </div>
                            <div ref="consultationChartRef" style="height: 260px;width: 100%;"></div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;" v-if="summary">
                <el-card style="width: 100%;">
                    <template #header>
                        <div>用户活跃度趋势</div>
                    </template>
                    <div class="chart-content">
                        <div ref="activityChartRef" style="height: 260px;width: 100%;"></div>
                    </div>
                </el-card>
            </el-row>
        </div>
    </div>
</template>
<script setup lang="ts">
import PageHead from '@/components/PageHead.vue'
import { onMounted, ref, nextTick } from 'vue'
import { getSummary } from '@/api/admin'
import * as echarts from 'echarts'

// 综合数据
const summary = ref<any>(null)
const loading = ref<boolean>(false)

onMounted(async () => {
    loading.value = true
    const res = await getSummary()
    if (res.data.code === '200') {
        summary.value = res.data.data
        loading.value = false
    }
    await nextTick()
    initCharts()
})

// 初始化图标
const initCharts = () => {
    initemotionCharts()
    inconsultationCharts()
    activityCharts()
}

// 情绪趋势分析图表
let emotionChart = <any>null
const emotionChartRef = ref<any>(null)
const initemotionCharts = () => {
    if (!emotionChartRef.value) return
    //销毁旧图表
    if (emotionChart) {
        emotionChart.dispose()
    }
    //初始化新图表
    emotionChart = echarts.init(emotionChartRef.value)
    //配置
    const option = {
        title: {
            text: '情绪趋势分析',
            textStyle: {
                fontSize: 16,
                color: '#2d3436',
                fontWeight: '600'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#2d3436'
            }
        },
        legend: {
            data: ['平均情绪评分', '记录数量'],
            top: 40
        },
        grid: {
            top: 80,
            bottom: 20,
            left: '3%',
            right: '4%'
        },
        xAxis: {
            type: 'category',
            data: summary.value.emotionTrend.map((item: any) => item.date),
            axisLine: {
                lineStyle: {
                    color: '#2d3436',
                }
            }
        },
        yAxis: [{
            type: 'value',
            name: '情绪评分',
            position: 'left'
        },
        {
            type: 'value',
            name: '记录数量',
            position: 'right'
        }],
        series: [
            {
                name: '平均情绪评分',
                type: 'line',
                data: summary.value.emotionTrend.map((item: any) => item.avgMoodScore),
                smooth: true,
                lineStyle: {
                    color: '#fab1a0',
                    width: 3
                },
                itemStyle: {
                    color: '#fab1a0'
                }
            },
            {
                name: '记录数量',
                type: 'line',
                data: summary.value.emotionTrend.map((item: any) => item.recordCount),
                smooth: true,
                lineStyle: {
                    color: '#eeb5a3',
                    width: 3
                },
                itemStyle: {
                    color: '#eeb5a3'
                }
            }
        ]
    }
    //设置图表
    emotionChart.setOption(option)
}

// 咨询会话统计图表
let consultationChart = <any>null
const consultationChartRef = ref<any>(null)
const inconsultationCharts = () => {
    if (!consultationChartRef.value) return
    //销毁旧图表
    if (consultationChart) {
        consultationChart.dispose()
    }
    //初始化新图表
    consultationChart = echarts.init(consultationChartRef.value)
    //配置
    const option = {
        title: {
            text: '咨询活动统计',
            textStyle: {
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3436'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#2d3436'
            }
        },
        legend: {
            data: ['会话数量', '参与用户数'],
            top: 40,
            textStyle: {
                color: '#636e72'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 80,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: summary.value.consultationStats.dailyTrend.map((item: any) => item.date),
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            axisLabel: {
                color: '#636e72'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#636e72'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.1)'
                }
            }
        },
        series: [
            {
                name: '会话数量',
                type: 'bar',
                data: summary.value.consultationStats.dailyTrend.map((item: any) => item.sessionCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#74b9ff' },
                            { offset: 1, color: '#0984e3' }
                        ]
                    }
                },
                barWidth: '40%'
            },
            {
                name: '参与用户数',
                type: 'bar',
                data: summary.value.consultationStats.dailyTrend.map((item: any) => item.userCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#fdcb6e' },
                            { offset: 1, color: '#f39c12' }
                        ]
                    }
                },
                barWidth: '40%'
            }
        ]
    }
    consultationChart.setOption(option)
}

// 用户活跃度趋势图表
let activityChart = <any>null
const activityChartRef = ref<any>(null)
const activityCharts = () => {
    if (!activityChartRef.value) return
    //销毁旧图表
    if (activityChart) {
        activityChart.dispose()
    }
    //初始化新图表
    activityChart = echarts.init(activityChartRef.value)
    //配置
    const option = {
        title: {
            text: '用户活跃度趋势',
            textStyle: {
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3436'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#2d3436'
            }
        },
        legend: {
            data: ['会话数量', '参与用户数'],
            top: 40,
            textStyle: {
                color: '#636e72'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 80,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: summary.value.consultationStats.dailyTrend.map((item: any) => item.date),
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            axisLabel: {
                color: '#636e72'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#636e72'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.1)'
                }
            }
        },
        series: [
            {
                name: '会话数量',
                type: 'bar',
                data: summary.value.consultationStats.dailyTrend.map((item: any) => item.sessionCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#74b9ff' },
                            { offset: 1, color: '#0984e3' }
                        ]
                    }
                },
                barWidth: '40%'
            },
            {
                name: '参与用户数',
                type: 'bar',
                data: summary.value.consultationStats.dailyTrend.map((item: any) => item.userCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#fdcb6e' },
                            { offset: 1, color: '#f39c12' }
                        ]
                    }
                },
                barWidth: '40%'
            }
        ]
    }
    activityChart.setOption(option)
}
</script>

<style scoped lang="scss">
.dashboard-container {
    .card-content {
        display: flex;
        align-items: center;

        .avatar {
            margin-right: 12px;
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            &.users {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.like {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.comments {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            &.smile {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
        }

        .info {
            .title {
                font-size: 14px;
                color: #7f8c8d;
                margin-bottom: 4px;
            }

            .value {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px
            }

            .subtitle-title {
                font-size: 12px;
                color: #95a5a6;
            }
        }
    }

    .chart-content {
        padding: 20px;
        height: 300px;
        position: relative;

        canvas {
            width: 100% !important;
            height: 100% !important;
        }

        .consultation-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;

            .stat-item {
                text-align: center;

                .stat-label {
                    font-size: 12px;
                    color: #7f8c8d;
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                }
            }
        }
    }
}
</style>